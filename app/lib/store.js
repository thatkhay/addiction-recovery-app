// lib/store.js
// A tiny localStorage-backed store read through useSyncExternalStore.
// - Server render and hydration always see the fallback, so markup matches.
// - Every component reading the same key stays in sync (and across tabs).
import { useCallback, useSyncExternalStore } from "react";

const cache = new Map();
const listeners = new Map();

function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  if (!cache.has(key)) {
    try {
      const raw = window.localStorage.getItem(key);
      cache.set(key, raw === null ? fallback : JSON.parse(raw));
    } catch {
      cache.set(key, fallback);
    }
  }
  return cache.get(key);
}

function emit(key) {
  listeners.get(key)?.forEach((listener) => listener());
}

export function readValue(key, fallback) {
  return read(key, fallback);
}

const persistListeners = new Set();

/** Called with (key, value) after every non-silent write. Used by sync. */
export function onPersist(listener) {
  persistListeners.add(listener);
  return () => persistListeners.delete(listener);
}

/** `silent` writes (e.g. data pulled from the server) don't notify onPersist. */
export function writeValue(key, value, { silent = false } = {}) {
  if (value === undefined) cache.delete(key);
  else cache.set(key, value);
  try {
    if (value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save "${key}"`, error);
  }
  emit(key);
  if (!silent) persistListeners.forEach((l) => l(key, value));
}

export function updateValue(key, fallback, updater) {
  writeValue(key, updater(read(key, fallback)));
}

function subscribeKey(key, listener) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key).add(listener);

  const onStorage = (event) => {
    if (event.key !== key) return;
    cache.delete(key);
    listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.get(key)?.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Persistent state. `fallback` must be a stable reference (a module constant),
 * otherwise React will see a new server snapshot on every render.
 */
export function usePersistentState(key, fallback) {
  const subscribe = useCallback((l) => subscribeKey(key, l), [key]);
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback
  );
  const setValue = useCallback(
    (next) =>
      updateValue(key, fallback, (prev) =>
        typeof next === "function" ? next(prev) : next
      ),
    [key, fallback]
  );
  return [value, setValue];
}

export function localKeys(prefix = "recovery-") {
  const keys = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k?.startsWith(prefix)) keys.push(k);
  }
  return keys;
}

/** Remove all local app data on this device (does not touch the server). */
export function clearAll(prefix = "recovery-") {
  localKeys(prefix).forEach((k) => writeValue(k, undefined, { silent: true }));
  cache.clear();
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

// A shared clock so live timers re-render without each owning an interval.
let now = Date.now();
const clockListeners = new Set();
let clockTimer = null;

function subscribeClock(listener) {
  clockListeners.add(listener);
  if (!clockTimer) {
    clockTimer = setInterval(() => {
      now = Date.now();
      clockListeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}

/** Current time in ms, ticking every second. */
export function useNow() {
  return useSyncExternalStore(
    subscribeClock,
    () => now,
    () => 0
  );
}
