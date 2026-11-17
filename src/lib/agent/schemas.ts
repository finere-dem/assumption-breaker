import { z } from "zod";

export const LANGS = { en: "English", fr: "French" } as const;
export type Lang = keyof typeof LANGS;

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
  /** Extra query in the founder's language, to reach local sources. */
  localQuery: z.string().optional().default(""),
});

export const ClassificationSchema = z.object({
  items: z.array(
    z.object({
      sourceId: z.string(),
      stance: z.enum(["supports", "contradicts", "irrelevant"]),
      quote: z.string(),
      translation: z.string().optional().default(""),
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
  /** The quote in the founder's language when the source is in another one. */
  translation?: string;
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
