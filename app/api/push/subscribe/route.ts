import { getCurrentUser, rejectCrossSite } from "@/app/lib/server/auth";
import { getDb } from "@/app/lib/server/db";
import { handle } from "@/app/lib/server/http";

export const runtime = "nodejs";

const validTz = (tz: unknown) => {
  if (typeof tz !== "string") return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
};

/** Body: { subscription: PushSubscriptionJSON, tz } */
export const POST = handle(async (request: Request) => {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { subscription, tz } = await request.json().catch(() => ({}));
  const endpoint = subscription?.endpoint;
  const { p256dh, auth } = subscription?.keys || {};
  if (typeof endpoint !== "string" || !endpoint.startsWith("https://") || !p256dh || !auth) {
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const db = await getDb();
  await db.batch([
    {
      text: `INSERT INTO push_subscriptions (endpoint, user_id, p256dh, auth, created_at) VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (endpoint) DO UPDATE SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth`,
      params: [endpoint, user.id, p256dh, auth, Date.now()],
    },
    {
      text: `INSERT INTO push_prefs (user_id, tz) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET tz = excluded.tz`,
      params: [user.id, validTz(tz)],
    },
  ]);
  return Response.json({ ok: true });
});

/** Body: { endpoint } */
export const DELETE = handle(async (request: Request) => {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  const { endpoint } = await request.json().catch(() => ({}));
  const db = await getDb();
  await db.query("DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2", [endpoint, user.id]);
  return Response.json({ ok: true });
});
