// Precomputes real agent runs for the built-in example so demo visitors get
// instant results without spending free-tier quota. One file per language.
// Usage: npm run cache:examples          (both languages)
//        npm run cache:examples -- fr    (one language)

import { writeFileSync } from "node:fs";
import { gatherEvidence } from "../src/lib/agent/evidence";
import { generateHypotheses } from "../src/lib/agent/hypotheses";
import { analyzeNotes, generateGuide } from "../src/lib/agent/interviews";
import type { Lang } from "../src/lib/agent/schemas";
import { cacheKey } from "../src/lib/cache";
import { EXAMPLE_NOTES, EXAMPLES } from "../src/lib/ui/i18n";

async function buildLang(lang: Lang) {
  const cache: Record<string, unknown> = {};
  const idea = EXAMPLES[lang];
  console.log(`[${lang}] hypotheses`);
  const hyp = await generateHypotheses(idea, lang);
  cache[cacheKey("hypotheses", { idea, lang })] = hyp;

  for (const hypothesis of hyp.hypotheses) {
    console.log(`[${lang}] evidence ${hypothesis.id}`);
    cache[cacheKey("evidence", { idea, hypothesis, lang })] = await gatherEvidence(hypothesis, idea, lang);
  }

  // Default ranking: the first three, in the order proposed.
  const hypotheses = hyp.hypotheses.slice(0, 3);
  console.log(`[${lang}] guide + notes analysis`);
  cache[cacheKey("guide", { idea, hypotheses, lang })] = await generateGuide(idea, hypotheses, lang);
  const notes = EXAMPLE_NOTES[lang];
  cache[cacheKey("analyze", { idea, hypotheses, notes, lang })] = await analyzeNotes(idea, hypotheses, notes, lang);

  const out = `src/data/example-cache.${lang}.json`;
  writeFileSync(out, JSON.stringify(cache));
  console.log(`Saved ${Object.keys(cache).length} entries to ${out}`);
}

async function main() {
  const only = process.argv[2] as Lang | undefined;
  for (const lang of only ? [only] : (["en", "fr"] as Lang[])) await buildLang(lang);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
