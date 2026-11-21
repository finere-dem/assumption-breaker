// CLI run of the agent pipeline: idea -> hypotheses -> (founder picks) -> evidence.
// Usage:
//   npm run pipeline -- examples/intergenerational-housing.txt            (picks H1,H2,H3)
//   npm run pipeline -- examples/intergenerational-housing-fr.txt --pick 2,4,5 --lang fr
// The --pick flag stands in for the founder's ranking (human checkpoint #1 in the UI).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { generateHypotheses } from "../src/lib/agent/hypotheses";
import { gatherEvidence } from "../src/lib/agent/evidence";
import type { Usage } from "../src/lib/llm";
import { summarizeUsage } from "../src/lib/usage";

async function main() {
  const [file, ...rest] = process.argv.slice(2);
  if (!file) {
    console.error("Usage: npm run pipeline -- <idea-file> [--pick 1,3,5]");
    process.exit(1);
  }
  const idea = readFileSync(file, "utf8").trim();
  const pickArg = rest[rest.indexOf("--pick") + 1];
  const picks = rest.includes("--pick") && pickArg ? pickArg.split(",").map(Number) : [1, 2, 3];
  const lang = rest[rest.indexOf("--lang") + 1] === "fr" ? "fr" : "en";

  const allUsage: Usage[] = [];
  const t0 = Date.now();

  console.log("Generating hypotheses...");
  const { hypotheses, usage } = await generateHypotheses(idea, lang);
  allUsage.push(...usage);
  for (const h of hypotheses) {
    console.log(`  ${h.id} [${h.category}] ${h.statement}\n      risk: ${h.whyRisky}`);
  }

  const selected = picks.map((n) => hypotheses[n - 1]).filter(Boolean);
  console.log(`\nFounder keeps: ${selected.map((h) => h.id).join(", ")}\n`);

  const evidence = [];
  for (const h of selected) {
    console.log(`Testing ${h.id}: ${h.statement}`);
    const { result, usage: u } = await gatherEvidence(h, idea, lang);
    allUsage.push(...u);
    evidence.push(result);
    console.log(`  queries: ${result.queries.join(" | ")}`);
    console.log(
      `  ${result.sourcesScanned} sources read, ${result.evidence.length} kept, ${result.rejectedQuotes} unverifiable quotes dropped -> ${result.signal}`,
    );
    for (const e of result.evidence) {
      console.log(`    ${e.stance === "supports" ? "+" : "-"} "${e.quote}"\n      ${e.url}`);
    }
    if (result.searchFailures.length) console.log(`  search failures: ${result.searchFailures.length}`);
  }

  const summary = summarizeUsage(allUsage);
  console.log(
    `\nRun: ${((Date.now() - t0) / 1000).toFixed(1)} s, ${summary.calls} model calls, ${summary.totalTokens} tokens, ${summary.costEur} EUR`,
  );
  console.log(summary.byProvider);

  mkdirSync("out", { recursive: true });
  const outFile = `out/run-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(outFile, JSON.stringify({ idea, hypotheses, picks, evidence, usage: summary }, null, 2));
  console.log(`Saved ${outFile}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
