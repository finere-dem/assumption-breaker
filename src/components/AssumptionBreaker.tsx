"use client";

import { useEffect, useState } from "react";
import type { Analysis, Guide } from "@/lib/agent/interviews";
import type { Hypothesis, HypothesisEvidence } from "@/lib/agent/schemas";
import type { Usage } from "@/lib/llm";
import { DICTS } from "@/lib/ui/i18n";
import { emptySession, loadSession, saveSession, type Session } from "@/lib/ui/session";
import { summarizeUsage } from "@/lib/usage";
import { Button } from "./ui";
import { StepAssumptions } from "./StepAssumptions";
import { StepEvidence } from "./StepEvidence";
import { StepIdea } from "./StepIdea";
import { StepInterviews } from "./StepInterviews";
import { StepVerdict } from "./StepVerdict";

export type Patch = Partial<Session> | ((s: Session) => Partial<Session>);
export type Status = Record<string, "loading" | "error">;

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

export function AssumptionBreaker() {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>({});
  const [error, setError] = useState<string | null>(null);

  // localStorage only exists in the browser, so the saved session is restored after mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(loadSession() ?? emptySession());
  }, []);

  useEffect(() => {
    if (session) saveSession(session);
  }, [session]);

  if (!session) return null;
  const t = DICTS[session.lang];
  const usage = summarizeUsage(session.usage);

  const update = (patch: Patch) =>
    setSession((prev) => (prev ? { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) } : prev));

  const addUsage = (u: Usage[]) => update((s) => ({ usage: [...s.usage, ...u] }));

  async function findAssumptions() {
    if (!session) return;
    setError(null);
    setStatus({ hypotheses: "loading" });
    update((s) => ({ startedAt: s.startedAt ?? Date.now() }));
    try {
      const r = await post<{ hypotheses: Hypothesis[]; usage: Usage[] }>("/api/hypotheses", {
        idea: session.idea,
        lang: session.lang,
      });
      addUsage(r.usage);
      update({
        hypotheses: r.hypotheses,
        ranked: [],
        evidence: {},
        dismissed: [],
        guide: null,
        analysis: null,
        step: 2,
      });
      setStatus({});
    } catch {
      setError(t.busy);
      setStatus({ hypotheses: "error" });
    }
  }

  // One request per assumption, in rank order, so free-tier rate limits are respected.
  async function searchEvidence(s: Session) {
    update({ step: 3 });
    for (const id of s.ranked) {
      if (s.evidence[id]) continue;
      const hypothesis = s.hypotheses.find((h) => h.id === id);
      if (!hypothesis) continue;
      setStatus((st) => ({ ...st, [id]: "loading" }));
      try {
        const r = await post<{ result: HypothesisEvidence; usage: Usage[] }>("/api/evidence", {
          idea: s.idea,
          hypothesis,
          lang: s.lang,
        });
        addUsage(r.usage);
        update((cur) => ({ evidence: { ...cur.evidence, [id]: r.result } }));
        setStatus((st) => Object.fromEntries(Object.entries(st).filter(([k]) => k !== id)));
      } catch {
        setStatus((st) => ({ ...st, [id]: "error" }));
      }
    }
  }

  const rankedHypotheses = (s: Session) =>
    s.ranked.map((id) => s.hypotheses.find((h) => h.id === id)).filter((h) => h !== undefined);

  async function makeGuide() {
    if (!session) return;
    setStatus((st) => ({ ...st, guide: "loading" }));
    try {
      const r = await post<{ guide: Guide; usage: Usage[] }>("/api/interviews/guide", {
        idea: session.idea,
        hypotheses: rankedHypotheses(session),
        lang: session.lang,
      });
      addUsage(r.usage);
      update({ guide: r.guide });
      setStatus((st) => Object.fromEntries(Object.entries(st).filter(([k]) => k !== "guide")));
    } catch {
      setStatus((st) => ({ ...st, guide: "error" }));
    }
  }

  async function analyzeNotes() {
    if (!session) return;
    setStatus((st) => ({ ...st, analysis: "loading" }));
    try {
      const r = await post<{ analysis: Analysis; usage: Usage[] }>("/api/interviews/analyze", {
        idea: session.idea,
        hypotheses: rankedHypotheses(session),
        notes: session.notes,
        lang: session.lang,
      });
      addUsage(r.usage);
      update({ analysis: r.analysis });
      setStatus((st) => Object.fromEntries(Object.entries(st).filter(([k]) => k !== "analysis")));
    } catch {
      setStatus((st) => ({ ...st, analysis: "error" }));
    }
  }

  function restart() {
    if (!window.confirm(t.restartConfirm)) return;
    setSession(emptySession(session!.lang));
    setStatus({});
    setError(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:py-12">
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assumption Breaker</h1>
            <p className="mt-1 text-sm text-ink/70">{t.tagline}</p>
          </div>
          <div
            className="rounded-lg border border-line bg-white px-3 py-2 font-mono text-xs text-ink/70"
            title={Object.keys(usage.byProvider).join(", ")}
          >
            {usage.totalTokens.toLocaleString()} {t.tokens} · {usage.calls} {t.calls} · {t.cost} 0 €
          </div>
        </div>
        <nav className="flex items-center gap-2 text-xs sm:text-sm" aria-label="Steps">
          {t.steps.map((label, i) => {
            const n = (i + 1) as Session["step"];
            const active = session.step === n;
            const done = session.step > n;
            return (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && <span className="h-px w-4 bg-line sm:w-8" />}
                <span
                  className={`flex items-center gap-1.5 ${active ? "font-semibold text-ink" : done ? "text-ink/70" : "text-ink/40"}`}
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[11px] ${active ? "bg-ink text-paper" : done ? "bg-ink/15" : "border border-line"}`}
                  >
                    {done ? "✓" : n}
                  </span>
                  {label}
                </span>
              </div>
            );
          })}
          {session.step > 1 && (
            <Button variant="ghost" className="ml-auto !px-2 !py-1" onClick={restart}>
              {t.restart}
            </Button>
          )}
        </nav>
      </header>

      <main className="flex flex-col gap-6">
        {session.step === 1 && (
          <StepIdea
            session={session}
            t={t}
            update={update}
            loading={status.hypotheses === "loading"}
            error={error}
            onSubmit={findAssumptions}
          />
        )}
        {session.step === 2 && (
          <StepAssumptions session={session} t={t} update={update} onSubmit={() => searchEvidence(session)} />
        )}
        {session.step === 3 && (
          <StepEvidence session={session} t={t} update={update} status={status} onRetry={() => searchEvidence(session)} />
        )}
        {session.step === 4 && (
          <StepInterviews
            session={session}
            t={t}
            update={update}
            status={status}
            onGuide={makeGuide}
            onAnalyze={analyzeNotes}
          />
        )}
        {session.step === 5 && <StepVerdict session={session} t={t} update={update} />}
      </main>
    </div>
  );
}
