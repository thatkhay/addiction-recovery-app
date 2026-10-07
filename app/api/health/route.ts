// app/api/health/route.ts
// Open /api/health in a browser to see whether the deployment is configured.
// Reports only yes/no and error messages, never secrets.
import { databaseUrl, getDb } from "@/app/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const found = databaseUrl();
  const dbUrl = found?.url;
  const database: Record<string, unknown> = {
    configured: Boolean(dbUrl),
    provider: found ? `postgres (from ${found.name})` : process.env.VERCEL ? "missing" : "local embedded postgres",
  };
  try {
    const db = await getDb();
    const [row] = await db.query<{ users: number }>("SELECT count(*)::int AS users FROM users");
    database.ok = true;
    database.users = row.users;
  } catch (error) {
    database.ok = false;
    database.error = error instanceof Error ? error.message : String(error);
  }

  const ai = {
    configured: Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN),
    note: "Optional. Without it the coach and daily card use built-in offline content.",
  };

  const ok = database.ok === true;
  return Response.json(
    {
      ok,
      database,
      ai,
      fix: ok
        ? null
        : !dbUrl && process.env.VERCEL
          ? "In Vercel: Storage → Create Database → Neon → connect it to this project, then Deployments → Redeploy."
          : "Check that DATABASE_URL is a valid Postgres connection string.",
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
