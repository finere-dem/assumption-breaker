import { z } from "zod";

export const HypothesisSchema = z.object({
  id: z.string(),
  statement: z.string().min(10),
  category: z.enum(["desirability", "feasibility", "viability"]),
  whyRisky: z.string(),
  ifWrong: z.string(),
});
export type Hypothesis = z.infer<typeof HypothesisSchema>;

export const HypothesesResultSchema = z.object({
  hypotheses: z.array(HypothesisSchema).min(3).max(8),
});

export const SearchPlanSchema = z.object({
  queries: z.array(z.string().min(3)).min(2).max(4),
});

export const ClassificationSchema = z.object({
  items: z.array(
    z.object({
      sourceId: z.string(),
      stance: z.enum(["supports", "contradicts", "irrelevant"]),
      quote: z.string(),
      why: z.string(),
    }),
  ),
});

export type EvidenceItem = {
  sourceId: string;
  title: string;
  url: string;
  origin: string;
  stance: "supports" | "contradicts";
  quote: string;
  why: string;
};

// The signal is computed in code from verified evidence, never by the model,
// and it is only an input for the founder's own verdict.
export type EvidenceSignal = "insufficient" | "leans-supported" | "leans-contradicted" | "mixed";

export type HypothesisEvidence = {
  hypothesisId: string;
  queries: string[];
  sourcesScanned: number;
  evidence: EvidenceItem[];
  rejectedQuotes: number;
  signal: EvidenceSignal;
  searchFailures: string[];
};
