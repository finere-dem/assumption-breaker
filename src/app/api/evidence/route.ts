import { z } from "zod";
import { withCache } from "@/lib/cache";
import { tooManyRequests } from "@/lib/guard";
import { gatherEvidence } from "@/lib/agent/evidence";
import { HypothesisSchema } from "@/lib/agent/schemas";

// Search + classification, with possible waits on free-tier rate limits.
export const maxDuration = 120;

const Body = z.object({
  idea: z.string().trim().min(30).max(2000),
  hypothesis: HypothesisSchema,
  lang: z.enum(["en", "fr"]).default("en"),
});

export async function POST(request: Request) {
  const limited = tooManyRequests(request);
  if (limited) return limited;
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const { idea, hypothesis, lang } = parsed.data;
  try {
    return Response.json(await withCache("evidence", parsed.data, () => gatherEvidence(hypothesis, idea, lang)));
  } catch (e) {
    console.error("evidence failed:", (e as Error).message);
    return Response.json(
      { error: "The free AI models are busy right now. Wait a minute, then retry." },
      { status: 503 },
    );
  }
}
