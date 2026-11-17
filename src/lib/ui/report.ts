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
        `> ${e.stance === "supports" ? "➕" : "➖"} "${e.translation ?? e.quote}"`,
        ...(e.translation ? [`> _${t.original}: "${e.quote}"_`] : []),
        `> ${e.why} [${e.title}](${e.url})`,
      );
    }
    if (kept.length === 0) lines.push(``, `_${t.noEvidence}_`);
  });

  if (s.guide) {
    lines.push(``, `## ${t.guideTitle}`, ``);
    s.ranked.forEach((id, i) => {
      for (const q of s.guide!.questions.filter((x) => x.hypothesisId === id)) {
        lines.push(`- (${i + 1}) ${q.question} _${t.reveals}: ${q.reveals}_`);
      }
    });
  }
  if (s.analysis) {
    lines.push(``, `## ${t.flagsTitle} (${s.analysis.flags.length})`, ``);
    for (const f of s.analysis.flags) {
      lines.push(`- **${t.bias[f.type]}**: "${f.excerpt}". ${f.explanation}${f.better ? ` ${t.instead}: "${f.better}"` : ""}`);
    }
    lines.push(``, `## ${t.learningsTitle} (${s.analysis.learnings.length})`, ``);
    for (const l of s.analysis.learnings) {
      lines.push(`- (${s.ranked.indexOf(l.hypothesisId) + 1}) ${l.stance === "supports" ? "➕" : "➖"} "${l.excerpt}". ${l.why}`);
    }
  }

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
