import type { Analysis, Guide } from "../agent/interviews";
import type { Hypothesis, HypothesisEvidence, Lang } from "../agent/schemas";
import type { Usage } from "../llm";

export type Decision = "continue" | "pivot" | "stop";

// Everything stays in the founder's browser: no account, no database.
export type Session = {
  step: 1 | 2 | 3 | 4 | 5;
  lang: Lang;
  idea: string;
  hypotheses: Hypothesis[];
  /** Ids of the assumptions to test, in the founder's order of risk. */
  ranked: string[];
  evidence: Record<string, HypothesisEvidence>;
  /** `${hypothesisId}:${sourceId}` of evidence the founder judged irrelevant. */
  dismissed: string[];
  guide: Guide | null;
  notes: string;
  analysis: Analysis | null;
  decision: Decision | null;
  reason: string;
  nextStep: string;
  /** When the agent was first asked to analyse this idea (ms), for the time-saved measure. */
  startedAt: number | null;
  usage: Usage[];
};

export const MAX_RANKED = 3;
export const MIN_REASON = 40;

export function emptySession(lang: Lang = "en"): Session {
  return {
    step: 1,
    lang,
    idea: "",
    hypotheses: [],
    ranked: [],
    evidence: {},
    dismissed: [],
    guide: null,
    notes: "",
    analysis: null,
    decision: null,
    reason: "",
    nextStep: "",
    startedAt: null,
    usage: [],
  };
}

const KEY = "assumption-breaker:v2";

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(s: Session): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Private mode or storage full: the app keeps working, only without resume.
  }
}

export function keptEvidence(s: Session, hypothesisId: string) {
  const ev = s.evidence[hypothesisId];
  if (!ev) return [];
  return ev.evidence.filter((e) => !s.dismissed.includes(`${hypothesisId}:${e.sourceId}`));
}
