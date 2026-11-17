// Public demo protection: free-tier quotas are shared by every visitor, so one
// person must not be able to burn them. In-memory, per server instance: good
// enough for a demo, not a security boundary.

const WINDOW_MS = 10 * 60_000;
const MAX_REQUESTS = 25;
const hits = new Map<string, number[]>();

export function tooManyRequests(request: Request): Response | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    return Response.json({ error: "rate-limited" }, { status: 429 });
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return null;
}
