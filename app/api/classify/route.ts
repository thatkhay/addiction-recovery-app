// app/api/classify/route.ts
// Maps free text ("doom-scrolling reddit at 3am", "knitting obsessively") to the
// closest catalog entry so the whole app can personalise around it.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { ADDICTIONS } from "@/app/lib/addictions";
import { getCurrentUser, rateLimit, rejectCrossSite } from "@/app/lib/server/auth";
import { handle } from "@/app/lib/server/http";

export const runtime = "nodejs";
export const maxDuration = 30;

const IDS = ADDICTIONS.map((a) => a.id) as [string, ...string[]];

const Classification = z.object({
  id: z.enum([...IDS, "none"]).describe("Closest catalog id, or none if nothing is reasonably close"),
  label: z.string().describe("A short, respectful label for what they described, 1 to 4 words, Title case"),
});

const SYSTEM = `You classify what someone in an addiction recovery app says they are recovering from.
Pick the single closest catalog id from this list (id: label):
${ADDICTIONS.map((a) => `${a.id}: ${a.label}`).join("\n")}
Use "none" only if nothing is reasonably close. Also give a short, respectful label for exactly what they described.`;

export const POST = handle(async (request: Request) => {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  if (!(await rateLimit(`classify:${user.id}`, 20, 60 * 60 * 1000))) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const { text } = await request.json().catch(() => ({}));
  if (typeof text !== "string" || !text.trim()) return Response.json({ error: "Expected { text }" }, { status: 400 });

  let client: Anthropic;
  try {
    client = new Anthropic();
  } catch {
    return Response.json({ error: "AI not configured" }, { status: 503 });
  }

  try {
    const response = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 1000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(Classification) },
      system: SYSTEM,
      messages: [{ role: "user", content: text.slice(0, 200) }],
    });
    const out = response.parsed_output;
    if (response.stop_reason === "refusal" || !out) return Response.json({ error: "Could not classify" }, { status: 502 });
    const match = ADDICTIONS.find((a) => a.id === out.id);
    return Response.json({ id: match?.id ?? null, category: match?.category ?? "general", label: out.label });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return Response.json({ error: "AI not configured" }, { status: 503 });
    if (error instanceof Anthropic.APIError) return Response.json({ error: "AI unavailable" }, { status: 502 });
    return Response.json({ error: "AI unavailable" }, { status: 503 });
  }
});
