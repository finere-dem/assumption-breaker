import type { Usage } from "./llm";

export type UsageSummary = {
  calls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  byProvider: Record<string, number>;
  costEur: 0;
};

// Every provider we call is free (free tier or local), so the cost is always 0:
// the tokens are still counted and shown, that is the frugality proof.
export function summarizeUsage(usage: Usage[]): UsageSummary {
  const byProvider: Record<string, number> = {};
  let promptTokens = 0;
  let completionTokens = 0;
  for (const u of usage) {
    promptTokens += u.promptTokens;
    completionTokens += u.completionTokens;
    const key = `${u.provider}:${u.model}`;
    byProvider[key] = (byProvider[key] ?? 0) + u.promptTokens + u.completionTokens;
  }
  return {
    calls: usage.length,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    byProvider,
    costEur: 0,
  };
}
