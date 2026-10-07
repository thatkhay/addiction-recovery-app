// public/sw.js
// Receives push notifications (even when the app is closed) and opens the
// right screen when one is tapped.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Recovery", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Recovery";
  const url = data.url || "/";

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const focused = windows.find((w) => w.focused && w.visibilityState === "visible");
      if (focused) {
        // The app is open: show it inside the app instead of as a system alert.
        focused.postMessage({ type: "notification", title, body: data.body, url, kind: data.kind });
        return;
      }
      await self.registration.showNotification(title, {
        body: data.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: data.kind || "recovery",
        renotify: true,
        data: { url },
      });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (existing) {
        await existing.focus();
        existing.postMessage({ type: "open", url });
        return;
      }
      await self.clients.openWindow(url);
    })()
  );
});
