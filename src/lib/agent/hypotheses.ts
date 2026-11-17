import { chatJson, type Usage } from "../llm";
import { HypothesesResultSchema, type Hypothesis } from "./schemas";

const SYSTEM = `You help early-stage founders find the riskiest assumptions behind their idea.
You never judge whether the idea is good. You only surface what must be true for it to work.

Rules:
- Return 5 to 7 hypotheses, each a single falsifiable sentence that real-world evidence could support or contradict.
- Cover the three categories: desirability (people have the problem and want a solution), feasibility (it can be built and delivered), viability (someone pays enough, the channel works).
- Prefer the assumptions that would kill the idea if wrong, not generic ones.
- "whyRisky": one sentence on why this is uncertain for THIS idea.
- "ifWrong": one sentence on what happens to the idea if the hypothesis is false.
- Write in the same language as the founder's idea.
- Answer with JSON only: {"hypotheses":[{"id":"H1","statement":"...","category":"desirability","whyRisky":"...","ifWrong":"..."}]}`;

export async function generateHypotheses(
  idea: string,
): Promise<{ hypotheses: Hypothesis[]; usage: Usage[] }> {
  const { data, usage } = await chatJson(
    [
      { role: "system", content: SYSTEM },
      { role: "user", content: `Founder's idea:\n"""${idea}"""` },
    ],
    HypothesesResultSchema,
  );
  // Renumber so ids stay stable and unique whatever the model returned.
  const hypotheses = data.hypotheses.map((h, i) => ({ ...h, id: `H${i + 1}` }));
  return { hypotheses, usage };
}
