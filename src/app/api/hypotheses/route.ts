import { z } from "zod";
import { withCache } from "@/lib/cache";
import { tooManyRequests } from "@/lib/guard";
import { generateHypotheses } from "@/lib/agent/hypotheses";

export const maxDuration = 60;

const Body = z.object({
  idea: z.string().trim().min(30).max(2000),
  lang: z.enum(["en", "fr"]).default("en"),
});

export async function POST(request: Request) {
  const limited = tooManyRequests(request);
  if (limited) return limited;
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "Describe your idea in 30 to 2,000 characters." },
      { status: 400 },
    );
  }
  try {
    return Response.json(await withCache("hypotheses", parsed.data, () => generateHypotheses(parsed.data.idea, parsed.data.lang)));
  } catch (e) {
    console.error("hypotheses failed:", (e as Error).message);
    return Response.json(
      { error: "The free AI models are busy right now. Wait a minute, then retry." },
      { status: 503 },
    );
  }
}
