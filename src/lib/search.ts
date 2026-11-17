// Evidence search over free sources: Tavily (free plan, needs TAVILY_API_KEY),
// and Hacker News (public Algolia API). Reddit was dropped: its public JSON
// refuses anonymous requests (HTTP 403). A failing source is skipped, never
// fatal: the agent reports "insufficient evidence" instead.

export type Source = {
  id: string;
  origin: "web" | "hackernews";
  title: string;
  url: string;
  text: string;
};

const MAX_TEXT = 700;

function clean(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT);
}

async function searchTavily(query: string): Promise<Omit<Source, "id">[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ query, max_results: 5, search_depth: "basic" }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`tavily HTTP ${res.status}`);
  const data = await res.json();
  return (data.results ?? []).map((r: { title: string; url: string; content: string }) => ({
    origin: "web" as const,
    title: r.title,
    url: r.url,
    text: clean(r.content ?? ""),
  }));
}

async function searchHackerNews(query: string): Promise<Omit<Source, "id">[]> {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=(story,comment)&hitsPerPage=5&optionalWords=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`hn HTTP ${res.status}`);
  const data = await res.json();
  return (data.hits ?? [])
    .map(
      (h: {
        objectID: string;
        title?: string;
        story_title?: string;
        story_text?: string;
        comment_text?: string;
      }) => ({
        origin: "hackernews" as const,
        title: h.title ?? h.story_title ?? "Hacker News discussion",
        url: `https://news.ycombinator.com/item?id=${h.objectID}`,
        text: clean(h.comment_text ?? h.story_text ?? h.title ?? ""),
      }),
    )
    .filter((s: { text: string }) => s.text.length > 40);
}

export type SearchReport = { sources: Source[]; failures: string[] };

export async function searchEvidence(queries: string[]): Promise<SearchReport> {
  const failures: string[] = [];
  const tasks = queries.flatMap((q) =>
    [searchTavily, searchHackerNews].map((fn) =>
      fn(q).catch((e: Error) => {
        failures.push(`${fn.name}("${q}"): ${e.message}`);
        return [];
      }),
    ),
  );
  // Web results first: forum noise from Hacker News only fills the remaining slots.
  const batches = (await Promise.all(tasks)).flat();
  batches.sort((a, b) => (a.origin === "web" ? 0 : 1) - (b.origin === "web" ? 0 : 1));
  const seen = new Set<string>();
  const sources: Source[] = [];
  for (const s of batches) {
    if (seen.has(s.url)) continue;
    seen.add(s.url);
    sources.push({ ...s, id: `S${sources.length + 1}` });
  }
  return { sources, failures };
}
