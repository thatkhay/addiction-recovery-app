// In-app notification inbox.
import { getCurrentUser, rejectCrossSite } from "@/app/lib/server/auth";
import { getDb } from "@/app/lib/server/db";
import { handle } from "@/app/lib/server/http";

export const runtime = "nodejs";

export const GET = handle(async () => {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  const db = await getDb();
  const items = await db.query<{ id: string; title: string; body: string; url: string; kind: string; created_at: string; read: boolean }>(
    "SELECT id, title, body, url, kind, created_at, read FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30",
    [user.id]
  );
  return Response.json(
    {
      unread: items.filter((n) => !n.read).length,
      items: items.map((n) => ({ ...n, id: String(n.id), created_at: Number(n.created_at) })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
});

/** Body: { action: "read-all" } */
export const POST = handle(async (request: Request) => {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  const db = await getDb();
  await db.query("UPDATE notifications SET read = true WHERE user_id = $1 AND read = false", [user.id]);
  return Response.json({ ok: true });
});
