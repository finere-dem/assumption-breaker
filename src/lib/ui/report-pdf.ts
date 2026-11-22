import type { jsPDF as JsPDF } from "jspdf";
import { computeSignal } from "../agent/signal";
import type { EvidenceSignal } from "../agent/schemas";
import { summarizeUsage } from "../usage";
import { DICTS } from "./i18n";
import { minutesSince } from "./report";
import { keptEvidence, type Session } from "./session";

// Built in the browser: the report never leaves the founder's device.
// The standard PDF fonts only cover Windows-1252, so text is normalised first.

const PAGE = { w: 210, h: 297, margin: 18 };
const WIDTH = PAGE.w - 2 * PAGE.margin;

type RGB = [number, number, number];
const INK: RGB = [27, 29, 34];
const MUTED: RGB = [110, 112, 118];
const HUMAN: RGB = [59, 91, 219];
const PRO: RGB = [43, 138, 62];
const CON: RGB = [201, 42, 42];
const LINE: RGB = [226, 223, 214];
const SIGNAL_COLOR: Record<EvidenceSignal, RGB> = {
  insufficient: MUTED,
  "leans-supported": PRO,
  "leans-contradicted": CON,
  mixed: [180, 110, 0],
};

// Characters that Windows-1252 adds in the 0x80-0x9F range (euro sign, curly quotes, dashes...).
const WIN1252_EXTRA = new Set(
  [
    0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152, 0x017d,
    0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e,
    0x0178,
  ].map((c) => String.fromCharCode(c)),
);

const chars = (...codes: number[]) => codes.map((c) => String.fromCharCode(c)).join("");
const HYPHENS = new RegExp(`[${chars(0x2010, 0x2011, 0x2012, 0x2212)}]`, "g");
const THIN_SPACES = new RegExp(`[${chars(0x202f, 0x2009, 0x200a)}]`, "g");
const LINE_SEPARATORS = new RegExp(`[${chars(0x2028, 0x2029)}]`, "g");
const HEAVY_PLUS = new RegExp(chars(0x2795), "g");
const HEAVY_MINUS = new RegExp(chars(0x2796), "g");

export function toPdfText(s: string): string {
  return s
    .replace(HYPHENS, "-")
    .replace(THIN_SPACES, " ")
    .replace(LINE_SEPARATORS, "\n")
    .replace(HEAVY_PLUS, "+")
    .replace(HEAVY_MINUS, "-")
    .replace(/[^\n\x20-\xFF]/g, (c) => (WIN1252_EXTRA.has(c) ? c : ""));
}

class Writer {
  y = PAGE.margin;
  constructor(readonly doc: JsPDF) {}

  ensure(height: number) {
    if (this.y + height > PAGE.h - PAGE.margin - 8) {
      this.doc.addPage();
      this.y = PAGE.margin;
    }
  }

  text(
    value: string,
    opts: { size?: number; bold?: boolean; italic?: boolean; color?: RGB; indent?: number; gap?: number } = {},
  ) {
    const { size = 10, bold = false, italic = false, color = INK, indent = 0, gap = 1.5 } = opts;
    const style = bold && italic ? "bolditalic" : bold ? "bold" : italic ? "italic" : "normal";
    this.doc.setFont("helvetica", style).setFontSize(size).setTextColor(...color);
    const lines = this.doc.splitTextToSize(toPdfText(value), WIDTH - indent) as string[];
    const lineH = size * 0.45;
    for (const line of lines) {
      this.ensure(lineH);
      this.doc.text(line, PAGE.margin + indent, this.y + lineH * 0.8);
      this.y += lineH;
    }
    this.y += gap;
  }

  link(label: string, url: string, indent = 0) {
    this.doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...HUMAN);
    const line = (this.doc.splitTextToSize(toPdfText(label), WIDTH - indent) as string[])[0];
    this.ensure(4.5);
    this.doc.textWithLink(line, PAGE.margin + indent, this.y + 3.2, { url });
    this.y += 5;
  }

  /** A quote with a coloured bar on its left. */
  quote(main: string, color: RGB, extra: { original?: string; why?: string; source?: { title: string; url: string } }) {
    // Keep a quote block on one page so its coloured bar stays whole.
    this.ensure(22);
    const start = this.y;
    const startPage = this.doc.getNumberOfPages();
    this.text(`« ${main} »`, { size: 10, italic: true, indent: 5, gap: 1 });
    if (extra.original) this.text(`${extra.original}`, { size: 8, color: MUTED, indent: 5, gap: 1 });
    if (extra.why) this.text(extra.why, { size: 8.5, color: MUTED, indent: 5, gap: 1 });
    if (extra.source) this.link(extra.source.title, extra.source.url, 5);
    if (this.doc.getNumberOfPages() === startPage) {
      this.doc.setFillColor(...color).rect(PAGE.margin, start, 1.2, this.y - start - 1, "F");
    }
    this.y += 2;
  }

  rule() {
    this.ensure(4);
    this.doc.setDrawColor(...LINE).setLineWidth(0.3).line(PAGE.margin, this.y, PAGE.w - PAGE.margin, this.y);
    this.y += 4;
  }

  heading(value: string) {
    this.ensure(14);
    this.y += 3;
    this.text(value, { size: 14, bold: true, gap: 2 });
  }
}

export async function buildPdf(s: Session, now = Date.now()): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const t = DICTS[s.lang];
  const w = new Writer(doc);
  const usage = summarizeUsage(s.usage);
  const date = new Date(now).toLocaleDateString(s.lang === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Title block
  w.text("Assumption Breaker", { size: 22, bold: true, gap: 1 });
  w.text(t.tagline, { size: 10, color: MUTED, gap: 1 });
  const meta = [date, s.startedAt ? t.duration(minutesSince(s.startedAt, now)) : null, `${usage.totalTokens} ${t.tokens} · ${t.cost} 0 EUR`]
    .filter(Boolean)
    .join("   |   ");
  w.text(meta, { size: 8.5, color: MUTED, gap: 3 });
  w.rule();

  // Verdict first: it is the founder's decision, the rest is the evidence behind it.
  w.heading(t.verdictTitle);
  if (s.decision) {
    w.text(t.decisions[s.decision].toUpperCase(), { size: 16, bold: true, color: HUMAN, gap: 2 });
  }
  if (s.reason.trim()) w.text(s.reason, { size: 10.5, gap: 2 });
  if (s.nextStep.trim()) w.text(`${t.nextLabel.replace(/\s*\(.*\)$/, "")} : ${s.nextStep}`, { size: 9.5, color: MUTED, gap: 2 });

  w.heading(t.steps[0]);
  w.text(s.idea, { size: 10.5, gap: 2 });

  w.heading(`${t.steps[1]} & ${t.steps[2]}`);
  s.ranked.forEach((id, i) => {
    const h = s.hypotheses.find((x) => x.id === id);
    if (!h) return;
    const kept = keptEvidence(s, id);
    const signal = computeSignal(kept);
    const field = s.analysis?.learnings.filter((l) => l.hypothesisId === id) ?? [];

    w.ensure(30);
    w.text(`${i + 1}. ${h.statement}`, { size: 11.5, bold: true, gap: 1 });
    const fieldPro = field.filter((l) => l.stance === "supports").length;
    w.text(
      `${t.category[h.category]}  ·  ${t.signal[signal]}${field.length ? `  ·  ${t.field} +${fieldPro} / -${field.length - fieldPro}` : ""}`,
      { size: 9, bold: true, color: SIGNAL_COLOR[signal], gap: 1 },
    );
    if (h.whyRisky !== "-") {
      w.text(`${t.whyRisky} : ${h.whyRisky}`, { size: 9, color: MUTED, gap: 0.5 });
      w.text(`${t.ifWrong} : ${h.ifWrong}`, { size: 9, color: MUTED, gap: 2 });
    }

    if (kept.length === 0) w.text(t.noEvidence, { size: 9.5, italic: true, color: MUTED, gap: 2 });
    for (const stance of ["supports", "contradicts"] as const) {
      const items = kept.filter((e) => e.stance === stance);
      if (!items.length) continue;
      w.text(`${stance === "supports" ? `+ ${t.supports}` : `- ${t.contradicts}`} (${items.length})`, {
        size: 9,
        bold: true,
        color: stance === "supports" ? PRO : CON,
        gap: 1.5,
      });
      for (const e of items) {
        w.quote(e.translation ?? e.quote, stance === "supports" ? PRO : CON, {
          original: e.translation ? `${t.original} : « ${e.quote} »` : undefined,
          why: e.why,
          source: { title: e.title, url: e.url },
        });
      }
    }
    w.y += 3;
  });

  if (s.analysis) {
    w.heading(t.steps[3]);
    w.text(`${t.learningsTitle} (${s.analysis.learnings.length})`, { size: 10.5, bold: true, gap: 1.5 });
    for (const l of s.analysis.learnings) {
      w.quote(l.excerpt, l.stance === "supports" ? PRO : CON, {
        why: `${s.ranked.indexOf(l.hypothesisId) + 1}. ${l.why}`,
      });
    }
    w.text(`${t.flagsTitle} (${s.analysis.flags.length})`, { size: 10.5, bold: true, gap: 1.5 });
    for (const f of s.analysis.flags) {
      w.text(t.bias[f.type], { size: 9, bold: true, color: CON, gap: 0.5 });
      w.quote(f.excerpt, CON, {
        why: f.better ? `${f.explanation} ${t.instead} : « ${f.better} »` : f.explanation,
      });
    }
  }

  if (s.guide) {
    w.heading(t.guideTitle);
    s.ranked.forEach((id, i) => {
      for (const q of s.guide!.questions.filter((x) => x.hypothesisId === id)) {
        w.text(`(${i + 1}) « ${q.question} »`, { size: 10, gap: 0.5 });
        w.text(`${t.reveals} : ${q.reveals}`, { size: 8.5, color: MUTED, indent: 5, gap: 2 });
      }
    });
  }

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...MUTED);
    doc.text(toPdfText(t.pdfFooter), PAGE.margin, PAGE.h - 10);
    doc.text(`${p} / ${pages}`, PAGE.w - PAGE.margin, PAGE.h - 10, { align: "right" });
  }

  return doc.output("blob");
}
