// lib/toast.js
// Global toast queue - call toast() from anywhere, render <Toaster /> once.
import { useSyncExternalStore } from "react";

let toasts = [];
const listeners = new Set();
const EMPTY = [];

function emit() {
  listeners.forEach((l) => l());
}

export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

/** action: optional { label, onClick } shown as a button (e.g. Undo). */
export function toast(message, severity = "success", duration = 3500, action = null) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  // Newest first; cap at two so toasts never bury the screen underneath.
  toasts = [{ id, message, severity, action }, ...toasts].slice(0, 2);
  emit();
  setTimeout(() => dismissToast(id), duration);
}

export function useToasts() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => toasts,
    () => EMPTY
  );
}
