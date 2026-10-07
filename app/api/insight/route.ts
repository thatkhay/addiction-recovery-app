// app/api/insight/route.ts
// One short, personalised "For you" card per day, written by Claude from the
// user's own patterns. The client falls back to curated content if this fails.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { getCurrentUser, rateLimit, rejectCrossSite } from "@/app/lib/server/auth";
import { handle } from "@/app/lib/server/http";

export const runtime = "nodejs";
export const maxDuration = 60;

const Insight = z.object({
  title: z.string().describe("3 to 6 words, warm, no emoji"),
  body: z.string().describe("2 or 3 short sentences, under 60 words, specific to this person"),
  action: z.enum(["sos", "play", "journal", "coach", "none"]).describe("The single most useful next step in the app"),
  journal_prompt: z.string().describe("A one-line journaling prompt tailored to them"),
});

const SYSTEM = `You write the daily "For you" card in an addiction recovery app. You get a JSON summary of one person's situation.

Write something that could only have been written for this person: use their stage of recovery, their triggers, their risky times of day, recent mood, and what they're recovering from. Be warm, concrete and practical. Never shame. Never give medical instructions beyond suggesting professional help where relevant. Vary your angle from day to day: sometimes encouragement, sometimes a practical plan, sometimes a reframe, sometimes noticing progress.

Actions: "sos" (craving toolkit) when risk is high right now, "play" (distraction games) for boredom or idle risky hours, "journal" for reflection, "coach" for low mood or confusion, "none" otherwise.`;

export const POST = handle(async (request: Request) => {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  if (!(await rateLimit(`insight:${user.id}`, 12, 60 * 60 * 1000))) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.signals) return Response.json({ error: "Expected { signals }" }, { status: 400 });

  const context = {
    recovering_from: String(body.addiction || "").slice(0, 80),
    their_why: String(body.motivation || "").slice(0, 300),
    today: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    ...body.signals,
  };

  let client: Anthropic;
  try {
    client = new Anthropic();
  } catch {
    return Response.json({ error: "AI not configured" }, { status: 503 });
  }

  try {
    const response = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(Insight) },
      system: SYSTEM,
      messages: [{ role: "user", content: JSON.stringify(context) }],
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return Response.json({ error: "No insight" }, { status: 502 });
    }
    return Response.json({ insight: response.parsed_output });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return Response.json({ error: "AI not configured" }, { status: 503 });
    if (error instanceof Anthropic.RateLimitError) return Response.json({ error: "Busy" }, { status: 429 });
    if (error instanceof Anthropic.APIError) {
      console.error(`Insight: API error ${error.status}`, error.message);
      return Response.json({ error: "AI unavailable" }, { status: 502 });
    }
    return Response.json({ error: "AI unavailable" }, { status: 503 });
  }
});
