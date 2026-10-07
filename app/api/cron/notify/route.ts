// app/api/cron/notify/route.ts
// Called on a schedule (GitHub Actions every 15 min, Vercel Cron daily as a
// backup). Decides who should get which reminder right now, in their own
// time zone. Each kind of notification is sent at most once per local day.
import { getDb } from "@/app/lib/server/db";
import { handle } from "@/app/lib/server/http";
import { notifyUser, type Note } from "@/app/lib/server/push";
import { MILESTONE_DAYS, milestoneLabel } from "@/app/utils/dateUtils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY = 86_400_000;
const PEAK_START: Record<string, number> = { morning: 7, afternoon: 12, evening: 17, night: 21 };

type Row = {
  user_id: string;
  tz: string;
  checkin_time: string;
  types: Record<string, boolean>;
  last_sent: Record<string, string>;
  name: string;
};

function local(tz: string, at: number) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date(at))
      .map((p) => [p.type, p.value])
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour), minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

const bucket = (hour: number) => (hour >= 5 && hour < 12 ? "morning" : hour >= 12 && hour < 17 ? "afternoon" : hour >= 17 && hour < 22 ? "evening" : "night");

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

async function run(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const now = Date.now();
  const rows = await db.query<Row>(
    `SELECT p.user_id, p.tz, p.checkin_time, p.types, p.last_sent, u.name
       FROM push_prefs p JOIN users u ON u.id = p.user_id
      WHERE EXISTS (SELECT 1 FROM push_subscriptions s WHERE s.user_id = p.user_id)`
  );

  let sent = 0;
  for (const row of rows) {
    const data = Object.fromEntries(
      (
        await db.query<{ key: string; value: unknown; updated_at: string }>(
          `SELECT key, value, updated_at FROM user_data WHERE user_id = $1
             AND key IN ('recovery-user-data', 'recovery-mood-entries', 'recovery-cravings')`,
          [row.user_id]
        )
      ).map((r) => [r.key, r])
    );
    const profile = data["recovery-user-data"]?.value as { addiction?: string; quitDate?: string; name?: string } | undefined;
    if (!profile?.quitDate) continue;

    const [{ last }] = await db.query<{ last: string | null }>("SELECT max(updated_at) AS last FROM user_data WHERE user_id = $1", [row.user_id]);
    const moods = (data["recovery-mood-entries"]?.value as { pledge?: boolean; timestamp: string }[]) || [];
    const cravings = (data["recovery-cravings"]?.value as { timestamp: string }[]) || [];

    const tz = row.tz || "UTC";
    const here = local(tz, now);
    const sentToday = (kind: string) => row.last_sent?.[kind] === here.date;
    const name = profile.name || row.name;
    const addiction = (profile.addiction || "it").toLowerCase();
    const days = Math.floor((now - new Date(profile.quitDate).getTime()) / DAY);
    const outbox: [string, Note][] = [];

    // 1. Milestone reached today.
    if (row.types?.milestone !== false && MILESTONE_DAYS.includes(days) && row.last_sent?.milestone !== `${profile.quitDate}:${days}`) {
      outbox.push([
        "milestone",
        { title: `${milestoneLabel(days)} free from ${addiction}`, body: `${name ? `${name}, that’s` : "That’s"} a real milestone. Take a moment to feel proud of it.`, kind: "milestone" },
      ]);
    }

    // 2. Daily check-in reminder, after the chosen time, if not done yet today.
    const [h, m] = (row.checkin_time || "09:00").split(":").map(Number);
    const checkedIn = moods.some((e) => e.pledge && local(tz, new Date(e.timestamp).getTime()).date === here.date);
    if (row.types?.checkin !== false && !checkedIn && !sentToday("checkin") && here.minutes >= h * 60 + m) {
      outbox.push(["checkin", { title: "Your daily check-in", body: days > 0 ? `Day ${days + 1}. One minute for yourself: how are you feeling today?` : "One minute for yourself: how are you feeling today?", url: "/?checkin=1", kind: "checkin" }]);
    }

    // 3. Heads-up at the start of their usual craving time.
    if (row.types?.risky !== false && cravings.length >= 5 && !sentToday("risky")) {
      const counts: Record<string, number> = {};
      cravings.forEach((c) => {
        const b = bucket(local(tz, new Date(c.timestamp).getTime()).hour);
        counts[b] = (counts[b] || 0) + 1;
      });
      const [peak, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (n >= 3 && here.hour === PEAK_START[peak]) {
        outbox.push(["risky", { title: `Heads up: ${peak}s are tougher for you`, body: "Have a plan ready for the next few hours. The SOS toolkit is one tap away.", url: "/?sos=1", kind: "risky" }]);
      }
    }

    // 4. Gentle nudge after a few quiet days (at a sociable hour).
    const quietFor = last ? now - Number(last) : 0;
    const lastComeback = row.last_sent?.comeback ? new Date(row.last_sent.comeback).getTime() : 0;
    if (row.types?.comeback !== false && quietFor > 3 * DAY && now - lastComeback > 3 * DAY && here.hour >= 10 && here.hour < 20) {
      outbox.push(["comeback", { title: "Thinking of you", body: "It’s been a few days. However things have gone, you can pick up right where you are.", kind: "comeback" }]);
    }

    if (!outbox.length) continue;
    const lastSent = { ...(row.last_sent || {}) };
    for (const [kind, note] of outbox) {
      await notifyUser(row.user_id, note);
      lastSent[kind] = kind === "milestone" ? `${profile.quitDate}:${days}` : here.date;
      sent++;
    }
    await db.query("UPDATE push_prefs SET last_sent = $2::jsonb WHERE user_id = $1", [row.user_id, JSON.stringify(lastSent)]);
  }

  return Response.json({ ok: true, users: rows.length, sent });
}

export const GET = handle(run);
export const POST = handle(run);
