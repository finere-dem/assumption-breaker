// Compare letters and digits only, so curly quotes, dashes or a dropped comma
// do not make a genuine quote look invented.
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** True when `quote` appears word for word (modulo punctuation and case) in `text`. */
export function quoteIsIn(quote: string, text: string): boolean {
  const q = normalize(quote);
  return q.length >= 8 && normalize(text).includes(q);
}
