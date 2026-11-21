import { createHash } from "node:crypto";
import exampleEn from "@/data/example-cache.en.json";
import exampleFr from "@/data/example-cache.fr.json";

// Two layers: results precomputed for the built-in examples (most demo visitors
// click "Use an example"), then a small in-memory cache for repeated requests.
// A cache hit costs no tokens, so it reports an empty usage.

const MAX_MEMORY = 200;
const memory = new Map<string, unknown>();
const examples = { ...exampleEn, ...exampleFr } as Record<string, unknown>;

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as object)
        .sort()
        .map((k) => [k, stable((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}

export function cacheKey(route: string, input: unknown): string {
  return createHash("sha256")
    .update(`${route}:${JSON.stringify(stable(input))}`)
    .digest("hex")
    .slice(0, 32);
}

export async function withCache<T extends { usage: unknown[] }>(
  route: string,
  input: unknown,
  compute: () => Promise<T>,
): Promise<T & { cached?: true }> {
  const key = cacheKey(route, input);
  const hit = (examples[key] ?? memory.get(key)) as T | undefined;
  if (hit) return { ...hit, usage: [], cached: true };
  const result = await compute();
  if (memory.size >= MAX_MEMORY) memory.delete(memory.keys().next().value!);
  memory.set(key, result);
  return result;
}
