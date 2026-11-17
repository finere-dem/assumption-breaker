import { z } from "zod";
import { generateGuide } from "@/lib/agent/interviews";
import { HypothesisSchema } from "@/lib/agent/schemas";

export const maxDuration = 60;

const Body = z.object({
  idea: z.string().trim().min(30).max(2000),
  hypotheses: z.array(HypothesisSchema).min(1).max(3),
  lang: z.enum(["en", "fr"]).default("en"),
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const { idea, hypotheses, lang } = parsed.data;
  try {
    return Response.json(await generateGuide(idea, hypotheses, lang));
  } catch (e) {
    console.error("guide failed:", (e as Error).message);
    return Response.json({ error: "busy" }, { status: 503 });
  }
}
