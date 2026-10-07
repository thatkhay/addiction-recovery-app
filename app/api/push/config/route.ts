import { pushConfigured } from "@/app/lib/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The public VAPID key the browser needs to subscribe. Safe to expose. */
export async function GET() {
  return Response.json({ enabled: pushConfigured(), publicKey: process.env.VAPID_PUBLIC_KEY || null });
}
