// lib/push.js
// Browser side of notifications and app install.
import { useSyncExternalStore } from "react";

export const isIOS = () =>
  typeof navigator !== "undefined" && (/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

export const isStandalone = () =>
  typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);

export const pushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

let registration = null;
export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    registration = await navigator.serviceWorker.register("/sw.js");
    return registration;
  } catch (error) {
    console.error("Service worker registration failed", error);
    return null;
  }
}

function urlBase64ToUint8Array(base64) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/**
 * Where this device stands:
 * unsupported | needs-install (iPhone: add to Home Screen first) | denied | on | off
 */
export async function pushStatus() {
  if (isIOS() && !isStandalone()) return "needs-install";
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const reg = registration || (await navigator.serviceWorker.getRegistration());
  const sub = await reg?.pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "on" : "off";
}

export async function enablePush() {
  if (isIOS() && !isStandalone()) throw new Error("On iPhone, add the app to your Home Screen first, then turn on notifications from there.");
  if (!pushSupported()) throw new Error("This browser doesn’t support notifications.");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notifications are blocked. You can allow them in your browser’s site settings.");

  const reg = registration || (await registerServiceWorker()) || (await navigator.serviceWorker.ready);
  const config = await (await fetch("/api/push/config", { cache: "no-store" })).json();
  if (!config.enabled) throw new Error("Notifications aren’t set up on the server yet (missing VAPID keys).");

  let subscription;
  try {
    subscription =
      (await reg.pushManager.getSubscription()) ||
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(config.publicKey) }));
  } catch {
    throw new Error("This browser couldn’t register for notifications. Check that notifications are allowed for this site, or try Chrome, Edge, Firefox or Safari.");
  }

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Couldn’t turn on notifications");
}

export async function disablePush() {
  const reg = registration || (await navigator.serviceWorker.getRegistration());
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await fetch("/api/push/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  }).catch(() => {});
  await sub.unsubscribe();
}

// ---- Install prompt ("Add to Home Screen") --------------------------------

let deferredPrompt = null;
const installListeners = new Set();
const emitInstall = () => installListeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // we show our own, nicer prompt
    deferredPrompt = event;
    emitInstall();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    emitInstall();
  });
}

/** "native" (Chrome/Edge/Android can install), "ios" (show instructions), or null. */
export function useInstallMode() {
  return useSyncExternalStore(
    (l) => {
      installListeners.add(l);
      return () => installListeners.delete(l);
    },
    () => (isStandalone() ? null : deferredPrompt ? "native" : isIOS() ? "ios" : null),
    () => null
  );
}

export async function promptInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  emitInstall();
  return outcome === "accepted";
}
