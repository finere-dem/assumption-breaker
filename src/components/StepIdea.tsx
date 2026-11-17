import type { Lang } from "@/lib/agent/schemas";
import { EXAMPLES, type Dict } from "@/lib/ui/i18n";
import type { Session } from "@/lib/ui/session";
import type { Patch } from "./AssumptionBreaker";
import { Button, ErrorBox, Spinner } from "./ui";

const MIN_IDEA = 30;

export function StepIdea({
  session,
  t,
  update,
  loading,
  error,
  onSubmit,
}: {
  session: Session;
  t: Dict;
  update: (p: Patch) => void;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
}) {
  const ready = session.idea.trim().length >= MIN_IDEA;
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t.ideaTitle}</h2>
          <p className="mt-1 text-sm text-ink/70">{t.ideaHelp}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          {t.language}
          <select
            className="rounded-md border border-line bg-white px-2 py-1"
            value={session.lang}
            disabled={loading}
            onChange={(e) => update({ lang: e.target.value as Lang })}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </label>
      </div>
      <textarea
        className="min-h-40 w-full rounded-xl border border-line bg-white p-4 text-base leading-relaxed outline-none focus:border-ink/40"
        placeholder={t.ideaPlaceholder}
        value={session.idea}
        maxLength={2000}
        disabled={loading}
        onChange={(e) => update({ idea: e.target.value })}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onSubmit} disabled={!ready || loading}>
          {t.findAssumptions}
        </Button>
        <Button variant="ghost" disabled={loading} onClick={() => update({ idea: EXAMPLES[session.lang] })}>
          {t.useExample}
        </Button>
      </div>
      {loading && <Spinner label={t.thinking} />}
      {error && !loading && <ErrorBox message={error} onRetry={onSubmit} retryLabel={t.retry} />}
    </section>
  );
}
