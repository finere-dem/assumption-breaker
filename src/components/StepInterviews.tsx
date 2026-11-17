import { EXAMPLE_NOTES, type Dict } from "@/lib/ui/i18n";
import type { Session } from "@/lib/ui/session";
import type { Patch, Status } from "./AssumptionBreaker";
import { Button, Checkpoint, ErrorBox, Spinner } from "./ui";

const MIN_NOTES = 80;

export function StepInterviews({
  session,
  t,
  update,
  status,
  onGuide,
  onAnalyze,
}: {
  session: Session;
  t: Dict;
  update: (p: Patch) => void;
  status: Status;
  onGuide: () => void;
  onAnalyze: () => void;
}) {
  const { guide, analysis } = session;
  const ranked = session.ranked
    .map((id) => session.hypotheses.find((h) => h.id === id))
    .filter((h) => h !== undefined);
  const rankOf = (id: string) => session.ranked.indexOf(id) + 1;

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold">{t.interviewsTitle}</h2>
      <Checkpoint>{t.checkpointInterviews}</Checkpoint>

      {!guide && status.guide !== "loading" && (
        <Button className="self-start" onClick={onGuide}>
          {t.makeGuide}
        </Button>
      )}
      {status.guide === "loading" && <Spinner label={t.makingGuide} />}
      {status.guide === "error" && <ErrorBox message={t.busy} onRetry={onGuide} retryLabel={t.retry} />}

      {guide && (
        <div className="grid gap-4 sm:grid-cols-[3fr_2fr]">
          <div className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">{t.guideTitle}</h3>
            {ranked.map((h) => (
              <div key={h.id} className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-human">
                  {rankOf(h.id)}. {h.statement}
                </p>
                <ol className="flex flex-col gap-2">
                  {guide.questions
                    .filter((q) => q.hypothesisId === h.id)
                    .map((q) => (
                      <li key={q.question} className="rounded-lg bg-paper p-3 text-sm">
                        <p className="font-medium">“{q.question}”</p>
                        <p className="mt-1 text-xs text-ink/60">
                          {t.reveals} : {q.reveals}
                        </p>
                      </li>
                    ))}
                </ol>
              </div>
            ))}
          </div>
          <div className="flex h-fit flex-col gap-3 rounded-xl border border-con/25 bg-con/5 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-con">{t.avoidTitle}</h3>
            {guide.avoid.map((a) => (
              <div key={a.bad} className="flex flex-col gap-1 text-sm">
                <p className="text-ink/60 line-through decoration-con/60">“{a.bad}”</p>
                <p className="text-xs text-ink/60">{a.whyBad}</p>
                <p>
                  <span className="text-xs font-semibold text-pro">{t.instead} : </span>“{a.better}”
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {guide && (
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="font-semibold">{t.notesTitle}</h3>
            <p className="mt-1 text-sm text-ink/70">{t.notesHelp}</p>
          </div>
          <textarea
            className="min-h-56 w-full rounded-xl border border-line bg-white p-4 font-mono text-sm leading-relaxed outline-none focus:border-ink/40"
            placeholder={t.notesPlaceholder}
            value={session.notes}
            maxLength={12000}
            disabled={status.analysis === "loading"}
            onChange={(e) => update({ notes: e.target.value, analysis: null })}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={onAnalyze}
              disabled={session.notes.trim().length < MIN_NOTES || status.analysis === "loading"}
            >
              {t.analyze}
            </Button>
            <Button
              variant="ghost"
              disabled={status.analysis === "loading"}
              onClick={() => update({ notes: EXAMPLE_NOTES[session.lang], analysis: null })}
            >
              {t.useExampleNotes}
            </Button>
          </div>
          {status.analysis === "loading" && <Spinner label={t.analyzing} />}
          {status.analysis === "error" && <ErrorBox message={t.busy} onRetry={onAnalyze} retryLabel={t.retry} />}
        </div>
      )}

      {analysis && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-con">
              {t.flagsTitle} ({analysis.flags.length})
            </h3>
            {analysis.flags.length === 0 && <p className="rounded-lg bg-muted p-3 text-sm">{t.noFlags}</p>}
            {analysis.flags.map((f) => (
              <div key={f.excerpt} className="flex flex-col gap-1.5 rounded-lg border border-line bg-white p-3 text-sm">
                <span className="w-fit rounded-full bg-con/10 px-2 py-0.5 text-xs font-semibold text-con">
                  {t.bias[f.type]}
                </span>
                <mark className="rounded bg-amber-200/60 px-1 py-0.5 leading-relaxed">“{f.excerpt}”</mark>
                <p className="text-xs text-ink/70">{f.explanation}</p>
                {f.better && (
                  <p className="text-xs">
                    <span className="font-semibold text-pro">{t.instead} : </span>“{f.better}”
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50">
              {t.learningsTitle} ({analysis.learnings.length})
            </h3>
            {analysis.learnings.length === 0 && (
              <p className="rounded-lg bg-muted p-3 text-sm">{t.noLearnings}</p>
            )}
            {analysis.learnings.map((l) => (
              <div
                key={`${l.hypothesisId}:${l.excerpt}`}
                className={`flex flex-col gap-1 rounded-lg border-l-4 bg-white p-3 text-sm ${l.stance === "supports" ? "border-pro" : "border-con"}`}
              >
                <p className="text-xs font-semibold text-human">
                  {rankOf(l.hypothesisId)}. {l.stance === "supports" ? `+ ${t.supports}` : `− ${t.contradicts}`}
                </p>
                <p className="leading-relaxed">“{l.excerpt}”</p>
                <p className="text-xs text-ink/70">{l.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <Button variant="ghost" onClick={() => update({ step: 3 })}>
          {t.back}
        </Button>
        <Button variant={analysis ? "primary" : "secondary"} onClick={() => update({ step: 5 })}>
          {analysis ? t.toVerdictFromInterviews : t.skipInterviews}
        </Button>
      </div>
    </section>
  );
}
