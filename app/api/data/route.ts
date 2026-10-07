// app/api/data/route.ts
// Per-user key/value storage that mirrors the app's localStorage keys.
import { getCurrentUser, rejectCrossSite } from "@/app/lib/server/auth";
import { getDb } from "@/app/lib/server/db";

export const runtime = "nodejs";

const KEY_PATTERN = /^recovery-[a-z0-9-]{1,60}$/;
const MAX_VALUE_BYTES = 2_000_000;

const unauthorized = () => Response.json({ error: "Not signed in" }, { status: 401 });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const db = await getDb();
  const rows = await db.query<{ key: string; value: unknown }>("SELECT key, value FROM user_data WHERE user_id = $1", [user.id]);
  const data = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return Response.json({ data }, { headers: { "Cache-Control": "no-store" } });
}

/** Body: { changes: { [key]: value | null } }. null deletes the key. */
export async function PUT(request: Request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const changes = body?.changes;
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
    return Response.json({ error: "Expected { changes }" }, { status: 400 });
  }

  const entries = Object.entries(changes);
  for (const [key, value] of entries) {
    if (!KEY_PATTERN.test(key)) return Response.json({ error: `Invalid key: ${key}` }, { status: 400 });
    if (value !== null && JSON.stringify(value).length > MAX_VALUE_BYTES) {
      return Response.json({ error: `Value too large: ${key}` }, { status: 413 });
    }
  }
  if (entries.length === 0) return Response.json({ ok: true, saved: 0 });

  const now = Date.now();
  const db = await getDb();
  await db.batch(
    entries.map(([key, value]) =>
      value === null
        ? { text: "DELETE FROM user_data WHERE user_id = $1 AND key = $2", params: [user.id, key] }
        : {
            text: `INSERT INTO user_data (user_id, key, value, updated_at) VALUES ($1, $2, $3::jsonb, $4)
                   ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
            params: [user.id, key, JSON.stringify(value), now],
          }
    )
  );
  return Response.json({ ok: true, saved: entries.length });
}

/** Wipe all of this user's recovery data (the account stays). */
export async function DELETE(request: Request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const db = await getDb();
  await db.query("DELETE FROM user_data WHERE user_id = $1", [user.id]);
  return Response.json({ ok: true });
}
