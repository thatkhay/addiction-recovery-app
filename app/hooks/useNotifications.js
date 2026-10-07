// hooks/useNotifications.js
// The in-app notification inbox, shared by the bell and the rest of the app.
import { useSyncExternalStore } from "react";

let state = { items: [], unread: 0 };
const listeners = new Set();
const SERVER = { items: [], unread: 0 };

function set(next) {
  state = next;
  listeners.forEach((l) => l());
}

export async function refreshNotifications() {
  try {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (res.ok) set(await res.json());
  } catch {
    // offline: keep what we have
  }
}

export async function markAllRead() {
  if (!state.unread) return;
  set({ items: state.items.map((n) => ({ ...n, read: true })), unread: 0 });
  await fetch("/api/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "read-all" }),
  }).catch(() => {});
}

export function useNotifications() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => SERVER
  );
}
