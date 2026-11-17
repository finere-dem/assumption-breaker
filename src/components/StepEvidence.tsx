import { computeSignal } from "@/lib/agent/signal";
import type { Dict } from "@/lib/ui/i18n";
import { keptEvidence, type Session } from "@/lib/ui/session";
import type { Patch, Status } from "./AssumptionBreaker";
import { Button, Checkpoint, ErrorBox, SignalBadge, Spinner } from "./ui";

export function StepEvidence({
  session,
  t,
  update,
  status,
  onRetry,
}: {
  session: Session;
  t: Dict;
  update: (p: Patch) => void;
  status: Status;
  onRetry: () => void;
}) {
  const allDone = session.ranked.every((id) => session.evidence[id]);

  const toggleDismiss = (key: string) =>
    update((s) => ({
      dismissed: s.dismissed.includes(key) ? s.dismissed.filter((k) => k !== key) : [...s.dismissed, key],
    }));

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold">{t.evidenceTitle}</h2>
      <Checkpoint>{t.checkpointEvidence}</Checkpoint>

      {session.ranked.map((id, i) => {
        const h = session.hypotheses.find((x) => x.id === id);
        if (!h) return null;
        const ev = session.evidence[id];
        const kept = keptEvidence(session, id);
        const signal = computeSignal(kept);
        return (
          <article key={id} className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4 sm:p-5">
            <header className="flex flex-wrap items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-human text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="min-w-0 flex-1 font-medium leading-snug">{h.statement}</p>
              {ev && <SignalBadge signal={signal} label={t.signal[signal]} />}
            </header>

            {!ev && status[id] !== "error" && <Spinner label={t.searching} />}
            {!ev && status[id] === "error" && (
              <ErrorBox
                message={t.busy}
                onRetry={onRetry}
                retryLabel={t.retry}
              />
            )}

            {ev && (
              <>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink/60">
                  <span className="font-semibold">{t.queries}:</span>
                  {ev.queries.map((q) => (
                    <span key={q} className="rounded-md bg-muted px-2 py-0.5 font-mono">
                      {q}
                    </span>
                  ))}
                </div>

                {ev.evidence.length === 0 ? (
                  <p className="rounded-lg bg-muted p-3 text-sm text-ink/70">{t.noEvidence}</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["supports", "contradicts"] as const).map((stance) => (
                      <div key={stance} className="flex flex-col gap-2">
                        <h3 className={`text-xs font-bold uppercase tracking-wide ${stance === "supports" ? "text-pro" : "text-con"}`}>
                          {stance === "supports" ? `+ ${t.supports}` : `− ${t.contradicts}`} (
                          {kept.filter((e) => e.stance === stance).length})
                        </h3>
                        {ev.evidence
                          .filter((e) => e.stance === stance)
                          .map((e) => {
                            const key = `${id}:${e.sourceId}`;
                            const dismissed = session.dismissed.includes(key);
                            return (
                              <div
                                key={key}
                                className={`flex flex-col gap-2 rounded-lg border-l-4 bg-paper p-3 text-sm ${stance === "supports" ? "border-pro" : "border-con"} ${dismissed ? "opacity-40" : ""}`}
                              >
                                <blockquote className={`leading-relaxed ${dismissed ? "line-through" : ""}`}>
                                  “{e.quote}”
                                </blockquote>
                                <p className="text-xs text-ink/70">{e.why}</p>
                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <a
                                    href={e.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="truncate text-human underline-offset-2 hover:underline"
                                    title={e.title}
                                  >
                                    {e.title}
                                  </a>
                                  <button
                                    className="shrink-0 text-ink/50 hover:text-ink"
                                    onClick={() => toggleDismiss(key)}
                                  >
                                    {dismissed ? t.restore : t.dismiss}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-ink/50">
                  {t.scanned(ev.sourcesScanned)}
                  {ev.rejectedQuotes > 0 && ` · ${t.rejected(ev.rejectedQuotes)}`}
                </p>
              </>
            )}
          </article>
        );
      })}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <Button variant="ghost" onClick={() => update({ step: 2 })}>
          {t.back}
        </Button>
        <Button onClick={() => update({ step: 4 })} disabled={!allDone}>
          {allDone ? t.toVerdict : t.waitAll}
        </Button>
      </div>
    </section>
  );
}
