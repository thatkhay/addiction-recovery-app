// lib/sync.js
// Mirrors localStorage app data to the signed-in user's account.
// Local writes are instant; changes are batched to the server in the background
// and retried when the network comes back.
import { useSyncExternalStore } from "react";
import { clearAll, localKeys, onPersist, readValue, writeValue } from "./store";

const OWNER_KEY = "rs-owner"; // which account the local data belongs to (never synced)
const DEBOUNCE_MS = 800;

let pending = new Map();
let timer = null;
let retryMs = 2000;
let stopListening = null;
let status = "idle"; // idle | saving | offline | error
const listeners = new Set();

function setStatus(next) {
  if (status === next) return;
  status = next;
  listeners.forEach((l) => l());
}

export function useSyncStatus() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => status,
    () => "idle"
  );
}

async function push(changes, { keepalive = false } = {}) {
  const res = await fetch("/api/data", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ changes }),
    keepalive,
  });
  if (!res.ok) throw Object.assign(new Error(`Sync failed (${res.status})`), { status: res.status });
}

async function flush() {
  clearTimeout(timer);
  timer = null;
  if (pending.size === 0) return;
  const batch = pending;
  pending = new Map();
  setStatus("saving");
  try {
    await push(Object.fromEntries(batch));
    retryMs = 2000;
    setStatus(pending.size ? "saving" : "idle");
    if (pending.size) schedule();
  } catch (error) {
    // Put the batch back underneath anything written since.
    pending = new Map([...batch, ...pending]);
    if (error.status === 401) return setStatus("error");
    setStatus(navigator.onLine ? "error" : "offline");
    timer = setTimeout(flush, retryMs);
    retryMs = Math.min(retryMs * 2, 60000);
  }
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(flush, DEBOUNCE_MS);
}

function flushOnExit() {
  if (pending.size === 0) return;
  push(Object.fromEntries(pending), { keepalive: true }).catch(() => {});
  pending = new Map();
}

const onVisibility = () => document.visibilityState === "hidden" && flushOnExit();
const onOnline = () => flush();

/**
 * Called once after sign-in: reconcile this device with the account, then
 * start mirroring writes.
 */
export async function startSync(userId) {
  stopSync();

  // Data left by a different account on this device must not leak into this one.
  const owner = window.localStorage.getItem(OWNER_KEY);
  if (owner && owner !== userId) clearAll();

  const res = await fetch("/api/data", { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load your data (${res.status})`);
  const { data } = await res.json();
  const serverKeys = Object.keys(data);

  if (serverKeys.length > 0) {
    // The account is the source of truth.
    localKeys().forEach((k) => !(k in data) && writeValue(k, undefined, { silent: true }));
    serverKeys.forEach((k) => writeValue(k, data[k], { silent: true }));
  } else {
    // New account: adopt anything already on this device (e.g. from before accounts existed).
    const local = Object.fromEntries(localKeys().map((k) => [k, readValue(k, null)]));
    if (Object.keys(local).length) await push(local);
  }
  window.localStorage.setItem(OWNER_KEY, userId);

  stopListening = onPersist((key, value) => {
    if (!key.startsWith("recovery-")) return;
    pending.set(key, value === undefined ? null : value);
    schedule();
  });
  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onVisibility);
  setStatus("idle");
}

export async function stopSync({ flushFirst = false } = {}) {
  if (flushFirst) await flush().catch(() => {});
  stopListening?.();
  stopListening = null;
  clearTimeout(timer);
  pending = new Map();
  window.removeEventListener("online", onOnline);
  document.removeEventListener("visibilitychange", onVisibility);
}

export async function deleteServerData() {
  pending = new Map();
  const res = await fetch("/api/data", { method: "DELETE", headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error("Could not delete data from your account");
}

export function forgetDevice() {
  clearAll();
  window.localStorage.removeItem(OWNER_KEY);
}
