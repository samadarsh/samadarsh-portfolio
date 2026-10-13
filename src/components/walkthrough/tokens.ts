export type Token = { kind: 'word' | 'cite'; text: string };

/** Splits text into words and [[p.N]] citation chips, keeping the spacing. */
export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  for (const part of text.split(/(\[\[p\.\d+\]\])/)) {
    if (!part) continue;
    const cite = part.match(/^\[\[(p\.\d+)\]\]$/);
    if (cite) out.push({ kind: 'cite', text: cite[1] });
    else for (const w of part.match(/\S+\s*|\s+/g) ?? []) out.push({ kind: 'word', text: w });
  }
  return out;
}
