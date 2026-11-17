import type { EvidenceItem, EvidenceSignal } from "./schemas";

// Pure function shared by the server and the UI: when the founder dismisses
// a piece of evidence, the signal is recomputed the same way.
export function computeSignal(evidence: Pick<EvidenceItem, "stance">[]): EvidenceSignal {
  const pro = evidence.filter((e) => e.stance === "supports").length;
  const con = evidence.filter((e) => e.stance === "contradicts").length;
  if (pro + con < 2) return "insufficient";
  if (con === 0) return "leans-supported";
  if (pro === 0) return "leans-contradicted";
  return "mixed";
}
