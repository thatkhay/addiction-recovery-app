import { getCurrentUser } from "@/app/lib/server/auth";
import { handle } from "@/app/lib/server/http";

export const runtime = "nodejs";

export const GET = handle(async () => {
  const user = await getCurrentUser();
  if (!user) return Response.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  return Response.json({ user }, { headers: { "Cache-Control": "no-store" } });
});
