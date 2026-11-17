import { z } from "zod";
import { chatJson, type Usage } from "../llm";
import { quoteIsIn } from "../text";
import { LANGS, type Hypothesis, type Lang } from "./schemas";

// ---------- Interview guide (Mom Test) ----------

export const GuideSchema = z.object({
  questions: z
    .array(
      z.object({
        hypothesisId: z.string(),
        question: z.string(),
        reveals: z.string(),
      }),
    )
    .min(4)
    .max(10),
  avoid: z
    .array(z.object({ bad: z.string(), whyBad: z.string(), better: z.string() }))
    .min(2)
    .max(4),
});
export type Guide = z.infer<typeof GuideSchema>;

const GUIDE_SYSTEM = `You write customer interview guides following "The Mom Test" (Rob Fitzpatrick):
- ask about the person's life and PAST behaviour ("Tell me about the last time..."), never about the future or opinions ("Would you buy...?", "Do you like...?");
- ask for specifics (when, how often, how much it cost, what they tried);
- never mention or pitch the founder's solution;
- one question at a time, short, open.
Write 2 or 3 questions per hypothesis, tagged with its id. "reveals": what the answer tells the founder about that hypothesis.
Also give 2 to 4 tempting BAD questions for this idea ("bad"), why they mislead ("whyBad") and a better version ("better").
Answer with JSON only: {"questions":[{"hypothesisId":"H1","question":"...","reveals":"..."}],"avoid":[{"bad":"...","whyBad":"...","better":"..."}]}`;

export async function generateGuide(
  idea: string,
  hypotheses: Hypothesis[],
  lang: Lang = "en",
): Promise<{ guide: Guide; usage: Usage[] }> {
  const list = hypotheses.map((h) => `${h.id}: ${h.statement}`).join("\n");
  const { data, usage } = await chatJson(
    [
      { role: "system", content: `${GUIDE_SYSTEM}\nWrite every text field in ${LANGS[lang]}.` },
      { role: "user", content: `Idea: ${idea}\n\nHypotheses to test:\n${list}` },
    ],
    GuideSchema,
  );
  const ids = new Set(hypotheses.map((h) => h.id));
  return { guide: { ...data, questions: data.questions.filter((q) => ids.has(q.hypothesisId)) }, usage };
}

// ---------- Bias detector on interview notes ----------

export const BIAS_TYPES = [
  "leading-question",
  "hypothetical",
  "pitching",
  "compliment",
  "vague-answer",
  "selective-listening",
] as const;
export type BiasType = (typeof BIAS_TYPES)[number];

const AnalysisSchema = z.object({
  flags: z.array(
    z.object({
      excerpt: z.string(),
      type: z.enum(BIAS_TYPES),
      explanation: z.string(),
      better: z.string().optional().default(""),
    }),
  ),
  learnings: z.array(
    z.object({
      hypothesisId: z.string(),
      stance: z.enum(["supports", "contradicts"]),
      excerpt: z.string(),
      why: z.string(),
    }),
  ),
});
export type Analysis = z.infer<typeof AnalysisSchema> & { rejectedExcerpts: number };

const ANALYSIS_SYSTEM = `You review a founder's customer interview notes to protect them from fooling themselves.

1. "flags": spots where the interview is biased. Types:
- "leading-question": the question suggests the expected answer.
- "hypothetical": asks about the future or "would you" instead of past behaviour.
- "pitching": the founder describes or sells the solution during the interview.
- "compliment": the interviewee is polite or enthusiastic ("great idea!") and the founder may take it as evidence.
- "vague-answer": a generic claim ("I always...", "all the time", "everyone...") that the founder did not follow with a request for a concrete example.
- "selective-listening": the founder's own notes or conclusions ignore or downplay something negative the interviewee said. When the notes end with the founder's conclusions, always compare them with what was actually said and flag any conclusion the facts do not back.
"better": the question the founder should have asked instead ("" if not a question).

2. "learnings": facts about PAST behaviour or concrete situations that support or contradict one of the hypotheses. Compliments, opinions and "I would" statements are NOT learnings.

"excerpt" MUST be copied word for word from the notes (5 to 40 words). Flag only real problems; an unbiased interview can have zero flags.
Answer with JSON only: {"flags":[{"excerpt":"...","type":"leading-question","explanation":"...","better":"..."}],"learnings":[{"hypothesisId":"H1","stance":"supports","excerpt":"...","why":"..."}]}`;

export async function analyzeNotes(
  idea: string,
  hypotheses: Hypothesis[],
  notes: string,
  lang: Lang = "en",
): Promise<{ analysis: Analysis; usage: Usage[] }> {
  const list = hypotheses.map((h) => `${h.id}: ${h.statement}`).join("\n");
  const { data, usage } = await chatJson(
    [
      {
        role: "system",
        content: `${ANALYSIS_SYSTEM}\nWrite "explanation", "better" and "why" in ${LANGS[lang]}; keep "excerpt" exactly as in the notes.`,
      },
      {
        role: "user",
        content: `Idea: ${idea}\n\nHypotheses:\n${list}\n\nInterview notes:\n"""${notes}"""`,
      },
    ],
    AnalysisSchema,
  );

  // Same rule as for web evidence: an excerpt that is not in the notes is dropped.
  const ids = new Set(hypotheses.map((h) => h.id));
  let rejectedExcerpts = 0;
  const flags = data.flags.filter((f) => quoteIsIn(f.excerpt, notes) || (rejectedExcerpts++, false));
  const learnings = data.learnings.filter(
    (l) => (ids.has(l.hypothesisId) && quoteIsIn(l.excerpt, notes)) || (rejectedExcerpts++, false),
  );
  return { analysis: { flags, learnings, rejectedExcerpts }, usage };
}
