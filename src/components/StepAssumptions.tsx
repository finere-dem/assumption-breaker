import { useState } from "react";
import type { Dict } from "@/lib/ui/i18n";
import { MAX_RANKED, type Session } from "@/lib/ui/session";
import type { Patch } from "./AssumptionBreaker";
import { Button, Checkpoint } from "./ui";

export function StepAssumptions({
  session,
  t,
  update,
  onSubmit,
}: {
  session: Session;
  t: Dict;
  update: (p: Patch) => void;
  onSubmit: () => void;
}) {
  const [own, setOwn] = useState("");
  const { hypotheses, ranked } = session;

  const toggle = (id: string) =>
    update((s) => ({
      ranked: s.ranked.includes(id)
        ? s.ranked.filter((x) => x !== id)
        : s.ranked.length < MAX_RANKED
          ? [...s.ranked, id]
          : s.ranked,
    }));

  const move = (id: string, dir: -1 | 1) =>
    update((s) => {
      const r = [...s.ranked];
      const i = r.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= r.length) return {};
      [r[i], r[j]] = [r[j], r[i]];
      return { ranked: r };
    });

  const edit = (id: string, statement: string) =>
    update((s) => ({
      hypotheses: s.hypotheses.map((h) => (h.id === id ? { ...h, statement } : h)),
      // Evidence found for the old wording no longer applies.
      evidence: Object.fromEntries(Object.entries(s.evidence).filter(([k]) => k !== id)),
    }));

  const addOwn = () => {
    const statement = own.trim();
    if (statement.length < 10) return;
    update((s) => ({
      hypotheses: [
        ...s.hypotheses,
        {
          id: `U${s.hypotheses.length + 1}`,
          statement,
          category: "desirability",
          whyRisky: "-",
          ifWrong: "-",
        },
      ],
    }));
    setOwn("");
  };

  // Ranked assumptions first, in the founder's order, then the others.
  const ordered = [
    ...ranked.map((id) => hypotheses.find((h) => h.id === id)!).filter(Boolean),
    ...hypotheses.filter((h) => !ranked.includes(h.id)),
  ];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{t.assumptionsTitle}</h2>
      <Checkpoint>{t.checkpoint1}</Checkpoint>

      <ul className="flex flex-col gap-3">
        {ordered.map((h) => {
          const rank = ranked.indexOf(h.id);
          const picked = rank >= 0;
          return (
            <li
              key={h.id}
              className={`flex gap-3 rounded-xl border p-4 transition-colors ${picked ? "border-human/50 bg-white shadow-sm" : "border-line bg-white/60"}`}
            >
              <div className="flex w-9 shrink-0 flex-col items-center gap-1">
                {picked ? (
                  <>
                    <button
                      className="text-xs text-ink/50 hover:text-ink disabled:opacity-20"
                      disabled={rank === 0}
                      onClick={() => move(h.id, -1)}
                      aria-label="Move up"
                    >
                      ▲
                    </button>
                    <span
                      className="flex size-7 items-center justify-center rounded-full bg-human text-sm font-bold text-white"
                      title={t.rank}
                    >
                      {rank + 1}
                    </span>
                    <button
                      className="text-xs text-ink/50 hover:text-ink disabled:opacity-20"
                      disabled={rank === ranked.length - 1}
                      onClick={() => move(h.id, 1)}
                      aria-label="Move down"
                    >
                      ▼
                    </button>
                  </>
                ) : (
                  <span className="mt-1 size-7 rounded-full border border-dashed border-line" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-ink/50">
                  {t.category[h.category]}
                </span>
                <textarea
                  className="w-full resize-none rounded-md border border-transparent bg-transparent p-1 -m-1 font-medium leading-snug outline-none hover:border-line focus:border-ink/30 focus:bg-white"
                  rows={2}
                  value={h.statement}
                  onChange={(e) => edit(h.id, e.target.value)}
                />
                {h.whyRisky !== "-" && (
                  <dl className="grid gap-1 text-sm text-ink/70 sm:grid-cols-2 sm:gap-4">
                    <div>
                      <dt className="text-xs font-semibold text-ink/50">{t.whyRisky}</dt>
                      <dd>{h.whyRisky}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-ink/50">{t.ifWrong}</dt>
                      <dd>{h.ifWrong}</dd>
                    </div>
                  </dl>
                )}
              </div>
              <Button
                variant={picked ? "secondary" : "primary"}
                className="h-fit shrink-0 !px-3 !py-1.5 text-xs"
                disabled={!picked && ranked.length >= MAX_RANKED}
                onClick={() => toggle(h.id)}
              >
                {picked ? t.untest : t.test}
              </Button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink/40"
          placeholder={t.ownPlaceholder}
          value={own}
          onChange={(e) => setOwn(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addOwn()}
          aria-label={t.addOwn}
        />
        <Button variant="secondary" onClick={addOwn} disabled={own.trim().length < 10}>
          {t.add}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <Button variant="ghost" onClick={() => update({ step: 1 })}>
          {t.back}
        </Button>
        <Button onClick={onSubmit} disabled={ranked.length === 0}>
          {ranked.length === 0 ? t.pickAtLeastOne : t.testSelected(ranked.length)}
        </Button>
      </div>
    </section>
  );
}
