// lib/server/push.ts
// Delivers notifications: saved to the in-app inbox, and pushed to every
// device the user enabled (works when the app is closed).
import webpush from "web-push";
import { getDb } from "./db";

export type Note = { title: string; body: string; url?: string; kind?: string };

export function pushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let configured = false;
function setup() {
  if (configured || !pushConfigured()) return pushConfigured();
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:support@example.com",
    process.env.VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  );
  configured = true;
  return true;
}

/** Save to the inbox and push to all of the user's devices. Returns devices reached. */
export async function notifyUser(userId: string, note: Note) {
  const db = await getDb();
  const url = note.url || "/";
  await db.query(
    "INSERT INTO notifications (user_id, title, body, url, kind, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
    [userId, note.title, note.body, url, note.kind || "info", Date.now()]
  );
  // Keep the inbox small.
  await db.query(
    `DELETE FROM notifications WHERE user_id = $1 AND id NOT IN
       (SELECT id FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30)`,
    [userId]
  );

  if (!setup()) return 0;
  const subs = await db.query<{ endpoint: string; p256dh: string; auth: string }>(
    "SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1",
    [userId]
  );
  const payload = JSON.stringify({ title: note.title, body: note.body, url, kind: note.kind || "info" });
  let delivered = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 60 * 60 * 6 });
        delivered++;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        // The browser unsubscribed or the subscription expired: forget it.
        if (status === 404 || status === 410) await db.query("DELETE FROM push_subscriptions WHERE endpoint = $1", [s.endpoint]);
        else console.error("Push failed", status, (error as Error).message);
      }
    })
  );
  return delivered;
}
