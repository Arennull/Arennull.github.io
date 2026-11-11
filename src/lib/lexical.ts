import type { Scored } from './vector';

const STOPWORDS = new Set(
  (
    'a an and are as at be by do does for from has have how i in is it its my of on or that the ' +
    'their then this to was what when which who why with you your did ' +
    'al como con cual cuando de del el en es esta este la las lo los mi para por que quien se ' +
    'sin su sus un una uno y has he eres'
  ).split(' '),
);

const STEM_LENGTH = 5;

/**
 * Lower-cases, strips accents, drops stopwords and cuts every word to a short
 * prefix. Prefix stemming is crude, but it makes "evaluate", "evaluation" and
 * "evalúas" meet without a language-specific stemmer.
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9@]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map((t) => t.slice(0, STEM_LENGTH));
}

export interface LexicalIndex<T> {
  search(query: string, k: number): Scored<T>[];
}

/** BM25 over a small in-memory collection. */
export function buildLexicalIndex<T>(
  items: T[],
  textOf: (item: T) => string,
  k1 = 1.2,
  b = 0.75,
): LexicalIndex<T> {
  const docs = items.map((item) => {
    const tokens = tokenize(textOf(item));
    const counts = new Map<string, number>();
    for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
    return { item, counts, length: tokens.length };
  });
  const avgLength = docs.reduce((s, d) => s + d.length, 0) / Math.max(1, docs.length);
  const docFreq = new Map<string, number>();
  for (const d of docs) for (const t of d.counts.keys()) docFreq.set(t, (docFreq.get(t) ?? 0) + 1);

  const idf = (term: string) => {
    const n = docFreq.get(term) ?? 0;
    return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
  };

  return {
    search(query, k) {
      const terms = [...new Set(tokenize(query))];
      return docs
        .map((d) => {
          let score = 0;
          for (const term of terms) {
            const tf = d.counts.get(term) ?? 0;
            if (tf === 0) continue;
            score +=
              (idf(term) * (tf * (k1 + 1))) / (tf + k1 * (1 - b + (b * d.length) / avgLength));
          }
          return { item: d.item, score };
        })
        .filter((s) => s.score > 0)
        .sort((a, b2) => b2.score - a.score)
        .slice(0, k);
    },
  };
}

/**
 * Reciprocal rank fusion. Only positions matter, so lists whose scores are on
 * different scales (cosine vs BM25) can be merged fairly.
 */
export function rrf<T>(lists: T[][], keyOf: (item: T) => string, k = 60): Scored<T>[] {
  const merged = new Map<string, Scored<T>>();
  for (const list of lists) {
    list.forEach((item, position) => {
      const key = keyOf(item);
      const entry = merged.get(key) ?? { item, score: 0 };
      entry.score += 1 / (k + position + 1);
      merged.set(key, entry);
    });
  }
  return [...merged.values()].sort((a, b) => b.score - a.score);
}
