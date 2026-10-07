import { endSession } from "@/app/lib/server/auth";
import { handle } from "@/app/lib/server/http";

export const runtime = "nodejs";

export const POST = handle(async () => {
  await endSession();
  return Response.json({ ok: true });
});
