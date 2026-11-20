import { computeSignal } from "@/lib/agent/signal";
import type { Dict } from "@/lib/ui/i18n";
import { useState } from "react";
import { buildReport, minutesSince } from "@/lib/ui/report";
import { keptEvidence, MIN_REASON, type Decision, type Session } from "@/lib/ui/session";
import type { Patch } from "./AssumptionBreaker";

// Public Google Form for testers; the first question (time spent) is prefilled.
const FEEDBACK_FORM =
  "https://docs.google.com/forms/d/e/1FAIpQLSfr4k07nAwAp5PaCPqsuWg1gNM2kLovKkg92VzBNXwv2mgUGA/viewform";
const TIME_FIELD = "entry.1305869352";

function feedbackUrl(minutes: number | null): string {
  return minutes === null ? FEEDBACK_FORM : `${FEEDBACK_FORM}?usp=pp_url&${TIME_FIELD}=${minutes}`;
}
import { Button, Checkpoint, SignalBadge } from "./ui";

export function StepVerdict({
  session,
  t,
  update,
}: {
  session: Session;
  t: Dict;
  update: (p: Patch) => void;
}) {
  const missing = Math.max(0, MIN_REASON - session.reason.trim().length);
  const ready = session.decision !== null && missing === 0;
  const [openedAt] = useState(() => Date.now());

  function download() {
    const blob = new Blob([buildReport(session)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assumption-breaker-report.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold">{t.verdictTitle}</h2>
      {session.startedAt && (
        <p className="text-sm text-ink/60">⏱ {t.duration(minutesSince(session.startedAt, openedAt))}</p>
      )}

      <div className="flex flex-col gap-2 rounded-xl border border-line bg-white p-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">{t.summary}</h3>
        {session.ranked.map((id, i) => {
          const h = session.hypotheses.find((x) => x.id === id);
          if (!h) return null;
          const signal = computeSignal(keptEvidence(session, id));
          const field = session.analysis?.learnings.filter((l) => l.hypothesisId === id) ?? [];
          const fieldPro = field.filter((l) => l.stance === "supports").length;
          return (
            <div key={id} className="flex flex-wrap items-center gap-3 border-t border-line pt-2 first-of-type:border-0 first-of-type:pt-0">
              <span className="text-sm font-bold text-human">{i + 1}</span>
              <p className="min-w-0 flex-1 text-sm">{h.statement}</p>
              {field.length > 0 && (
                <span className="rounded-full bg-human/10 px-2.5 py-1 text-xs font-semibold text-human">
                  {t.field} : +{fieldPro} / −{field.length - fieldPro}
                </span>
              )}
              <SignalBadge signal={signal} label={t.signal[signal]} />
            </div>
          );
        })}
      </div>

      <Checkpoint>{t.checkpoint2}</Checkpoint>

      <div className="grid grid-cols-3 gap-2" role="radiogroup">
        {(Object.keys(t.decisions) as Decision[]).map((d) => (
          <button
            key={d}
            role="radio"
            aria-checked={session.decision === d}
            onClick={() => update({ decision: d })}
            className={`rounded-xl border p-3 text-sm font-semibold transition-colors ${session.decision === d ? "border-ink bg-ink text-paper" : "border-line bg-white hover:bg-muted"}`}
          >
            {t.decisions[d]}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t.reasonLabel}
        <textarea
          className="min-h-28 rounded-xl border border-line bg-white p-3 font-normal leading-relaxed outline-none focus:border-ink/40"
          placeholder={t.reasonPlaceholder}
          value={session.reason}
          onChange={(e) => update({ reason: e.target.value })}
        />
        {missing > 0 && <span className="text-xs font-normal text-ink/50">{t.reasonTooShort(missing)}</span>}
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t.nextLabel}
        <input
          className="rounded-lg border border-line bg-white px-3 py-2 font-normal outline-none focus:border-ink/40"
          placeholder={t.nextPlaceholder}
          value={session.nextStep}
          onChange={(e) => update({ nextStep: e.target.value })}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <Button variant="ghost" onClick={() => update({ step: 4 })}>
          {t.back}
        </Button>
        <Button onClick={download} disabled={!ready}>
          {t.download}
        </Button>
      </div>

      <a
        href={feedbackUrl(session.startedAt ? minutesSince(session.startedAt, openedAt) : null)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-human/30 bg-human/8 p-4 text-sm hover:bg-human/12"
      >
        <span>
          <strong>{t.feedbackTitle}</strong> {t.feedbackText}
        </span>
        <span className="font-semibold text-human">{t.feedbackCta} →</span>
      </a>
    </section>
  );
}
