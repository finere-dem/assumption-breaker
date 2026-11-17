import { chatJson, type Usage } from "../llm";
import { searchEvidence, type Source } from "../search";
import {
  ClassificationSchema,
  SearchPlanSchema,
  type EvidenceItem,
  type EvidenceSignal,
  type Hypothesis,
  type HypothesisEvidence,
} from "./schemas";

const MAX_SOURCES_TO_READ = 12;

const PLAN_SYSTEM = `You plan web searches to TEST one specific hypothesis, not to confirm it, and not the idea in general.
Every query must be about the claim of THIS hypothesis (e.g. a hypothesis about cooks' hygiene rules gets queries about hygiene rules for home cooks, not about customer demand).
Return 3 short search queries (4 to 8 keywords, not sentences), in English unless the topic is local regulation or a local market (then also use the local language):
one looking for data or studies on the claim, one looking for evidence that the claim is false (failures, obstacles, alternatives), one looking for first-hand accounts (forums, interviews, reviews).
Answer with JSON only: {"queries":["...","...","..."]}`;

const CLASSIFY_SYSTEM = `You classify sources as evidence for or against a founder's hypothesis.
A hypothesis often bundles several claims (a problem, a number, a price). A source counts as evidence when it gives facts about at least one of those claims, even if it does not prove the exact figure.
For each source decide:
- "supports": facts that make the hypothesis (or one of its claims) more likely.
- "contradicts": facts that make it less likely (no demand, strong cheaper alternative, budgets too low, rules that block it...).
- "irrelevant": the source only mentions the topic without facts bearing on the claims, or concerns a different population or market.
Never stretch a source to fit. "why" must name which claim the source bears on.
"quote" MUST be copied word for word from the source text (10 to 40 words), or "" when irrelevant.
"why": one sentence, in the language of the hypothesis.
Answer with JSON only: {"items":[{"sourceId":"S1","stance":"irrelevant","quote":"","why":"..."}]}`;

// Compare letters and digits only, so curly quotes, dashes or a dropped comma
// do not make a genuine quote look invented.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function computeSignal(evidence: EvidenceItem[]): EvidenceSignal {
  const pro = evidence.filter((e) => e.stance === "supports").length;
  const con = evidence.filter((e) => e.stance === "contradicts").length;
  if (pro + con < 2) return "insufficient";
  if (con === 0) return "leans-supported";
  if (pro === 0) return "leans-contradicted";
  return "mixed";
}

export async function gatherEvidence(
  hypothesis: Hypothesis,
  idea: string,
): Promise<{ result: HypothesisEvidence; usage: Usage[] }> {
  const plan = await chatJson(
    [
      { role: "system", content: PLAN_SYSTEM },
      { role: "user", content: `Idea: ${idea}\nHypothesis to test: ${hypothesis.statement}` },
    ],
    SearchPlanSchema,
  );
  const queries = plan.data.queries;
  const { sources: found, failures } = await searchEvidence(queries);
  const sources: Source[] = found.slice(0, MAX_SOURCES_TO_READ);
  const usage = [...plan.usage];

  if (sources.length === 0) {
    return {
      result: {
        hypothesisId: hypothesis.id,
        queries,
        sourcesScanned: 0,
        evidence: [],
        rejectedQuotes: 0,
        signal: "insufficient",
        searchFailures: failures,
      },
      usage,
    };
  }

  const sourceBlock = sources
    .map((s) => `[${s.id}] (${s.origin}) ${s.title}\n${s.text}`)
    .join("\n\n");
  const classified = await chatJson(
    [
      { role: "system", content: CLASSIFY_SYSTEM },
      {
        role: "user",
        content: `Hypothesis: ${hypothesis.statement}\n\nSources:\n${sourceBlock}`,
      },
    ],
    ClassificationSchema,
  );
  usage.push(...classified.usage);

  // Keep only quotes that really appear in the source: the model cannot
  // invent evidence, a hallucinated quote is dropped and counted.
  const byId = new Map(sources.map((s) => [s.id, s]));
  let rejectedQuotes = 0;
  const evidence: EvidenceItem[] = [];
  for (const item of classified.data.items) {
    if (item.stance === "irrelevant") continue;
    const src = byId.get(item.sourceId);
    if (!src || item.quote.length < 10 || !normalize(src.text).includes(normalize(item.quote))) {
      rejectedQuotes++;
      continue;
    }
    evidence.push({
      sourceId: src.id,
      title: src.title,
      url: src.url,
      origin: src.origin,
      stance: item.stance,
      quote: item.quote,
      why: item.why,
    });
  }

  return {
    result: {
      hypothesisId: hypothesis.id,
      queries,
      sourcesScanned: sources.length,
      evidence,
      rejectedQuotes,
      signal: computeSignal(evidence),
      searchFailures: failures,
    },
    usage,
  };
}
