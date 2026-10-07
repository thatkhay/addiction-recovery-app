import { getCurrentUser } from "@/app/lib/server/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  return Response.json({ user }, { headers: { "Cache-Control": "no-store" } });
}
