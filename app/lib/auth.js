// lib/auth.js
// Client-side session state: loading -> anon | syncing -> ready.
import { useSyncExternalStore } from "react";
import { forgetDevice, startSync, stopSync } from "./sync";

let state = { status: "loading", user: null, error: null };
const listeners = new Set();
const SERVER_STATE = { status: "loading", user: null, error: null };

function set(next) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function useAuth() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => SERVER_STATE
  );
}

async function enter(user) {
  set({ status: "syncing", user, error: null });
  try {
    await startSync(user.id);
    set({ status: "ready" });
  } catch (error) {
    set({ status: "ready", error: error.message });
  }
}

let initStarted = false;
export async function initAuth() {
  if (initStarted) return;
  initStarted = true;
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    if (json.user) await enter(json.user);
    else set({ status: "anon", error: res.ok ? null : json.error || "The server isn’t responding properly. Try again shortly." });
  } catch {
    set({ status: "anon", error: "Can’t reach the server. Check your connection." });
  }
}

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Something went wrong (error ${res.status}). Please try again.`);
  return json;
}

export async function signIn(email, password) {
  const { user } = await post("/api/auth/login", { email, password });
  await enter(user);
}

export async function signUp(name, email, password) {
  const { user } = await post("/api/auth/signup", { name, email, password });
  await enter(user);
}

export async function signOut() {
  await stopSync({ flushFirst: true });
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  forgetDevice();
  set({ status: "anon", user: null, error: null });
}

export async function deleteAccount(password) {
  const res = await fetch("/api/auth/account", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Could not delete account");
  await stopSync();
  forgetDevice();
  set({ status: "anon", user: null, error: null });
}
