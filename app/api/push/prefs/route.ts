import { getCurrentUser, rejectCrossSite } from "@/app/lib/server/auth";
import { getDb } from "@/app/lib/server/db";
import { handle } from "@/app/lib/server/http";

export const runtime = "nodejs";

const TYPES = ["checkin", "milestone", "risky", "comeback"] as const;

export const GET = handle(async () => {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  const db = await getDb();
  const [prefs] = await db.query<{ tz: string; checkin_time: string; types: Record<string, boolean> }>(
    "SELECT tz, checkin_time, types FROM push_prefs WHERE user_id = $1",
    [user.id]
  );
  const [{ devices }] = await db.query<{ devices: number }>("SELECT count(*)::int AS devices FROM push_subscriptions WHERE user_id = $1", [user.id]);
  return Response.json({
    devices,
    checkinTime: prefs?.checkin_time ?? "09:00",
    types: prefs?.types ?? { checkin: true, milestone: true, risky: true, comeback: true },
  });
});

/** Body: { checkinTime?: "HH:MM", types?: { checkin, milestone, risky, comeback }, tz? } */
export const PUT = handle(async (request: Request) => {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  const body = await request.json().catch(() => ({}));

  const time = typeof body.checkinTime === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(body.checkinTime) ? body.checkinTime : null;
  const types = body.types && typeof body.types === "object" ? Object.fromEntries(TYPES.map((t) => [t, body.types[t] !== false])) : null;

  const db = await getDb();
  await db.query(
    `INSERT INTO push_prefs (user_id, checkin_time, types) VALUES ($1, COALESCE($2, '09:00'), COALESCE($3::jsonb, '{"checkin":true,"milestone":true,"risky":true,"comeback":true}'))
     ON CONFLICT (user_id) DO UPDATE SET
       checkin_time = COALESCE($2, push_prefs.checkin_time),
       types = COALESCE($3::jsonb, push_prefs.types)`,
    [user.id, time, types ? JSON.stringify(types) : null]
  );
  return Response.json({ ok: true });
});
