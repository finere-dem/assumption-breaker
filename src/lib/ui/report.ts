import { computeSignal } from "../agent/signal";
import { summarizeUsage } from "../usage";
import { DICTS } from "./i18n";
import { keptEvidence, type Session } from "./session";

export function buildReport(s: Session): string {
  const t = DICTS[s.lang];
  const usage = summarizeUsage(s.usage);
  const lines: string[] = [
    `# Assumption Breaker report`,
    ``,
    `_${new Date().toISOString().slice(0, 10)}_`,
    ``,
    `## ${t.steps[0]}`,
    ``,
    s.idea,
    ``,
    `## ${t.steps[1]} & ${t.steps[2]}`,
  ];

  s.ranked.forEach((id, i) => {
    const h = s.hypotheses.find((x) => x.id === id);
    if (!h) return;
    const kept = keptEvidence(s, id);
    const ev = s.evidence[id];
    lines.push(
      ``,
      `### ${i + 1}. ${h.statement}`,
      ``,
      `- ${t.category[h.category]} · **${t.signal[computeSignal(kept)]}**`,
      `- ${t.whyRisky}: ${h.whyRisky}`,
      `- ${t.ifWrong}: ${h.ifWrong}`,
    );
    if (ev) lines.push(`- ${t.queries}: ${ev.queries.join(" · ")}`);
    for (const e of kept) {
      lines.push(
        ``,
        `> ${e.stance === "supports" ? "➕" : "➖"} "${e.quote}"`,
        `> ${e.why} [${e.title}](${e.url})`,
      );
    }
    if (kept.length === 0) lines.push(``, `_${t.noEvidence}_`);
  });

  lines.push(
    ``,
    `## ${t.verdictTitle}`,
    ``,
    `**${s.decision ? t.decisions[s.decision] : "-"}**`,
    ``,
    s.reason,
  );
  if (s.nextStep.trim()) lines.push(``, `**${t.nextLabel}:** ${s.nextStep}`);
  lines.push(
    ``,
    `---`,
    `${usage.totalTokens} ${t.tokens} · ${usage.calls} ${t.calls} · ${t.cost}: 0 EUR · ${Object.keys(usage.byProvider).join(", ")}`,
  );
  return lines.join("\n");
}
