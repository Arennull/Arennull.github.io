import { describe, expect, it } from 'vitest';
import { FINAL_K, embeddedQueries, neurons, rankBy, searchText } from './brain';
import { evaluate, recallAt, reciprocalRank } from './eval';
import { LANGS } from './types';

describe('metrics', () => {
  it('recall counts the relevant items inside the cut', () => {
    expect(recallAt(['a', 'b', 'c', 'd'], ['b', 'd'], 2)).toBe(0.5);
    expect(recallAt(['a', 'b', 'c', 'd'], ['b', 'd'], 4)).toBe(1);
    expect(recallAt(['a'], ['z'], 5)).toBe(0);
    expect(recallAt(['a'], [], 5)).toBe(1);
  });

  it('reciprocal rank looks at the first relevant item only', () => {
    expect(reciprocalRank(['a', 'b', 'c'], ['c', 'b'])).toBe(0.5);
    expect(reciprocalRank(['a', 'b'], ['a'])).toBe(1);
    expect(reciprocalRank(['a', 'b'], ['z'])).toBe(0);
  });
});

describe('rankBy', () => {
  const { query, vec } = embeddedQueries[0]!;

  it('ranks the whole collection by meaning, and only the matches by keywords', () => {
    expect(rankBy('vector', vec, query.question.en, 'en')).toHaveLength(neurons.length);
    const lexical = rankBy('lexical', vec, query.question.en, 'en');
    expect(lexical.length).toBeGreaterThan(0);
    expect(lexical.length).toBeLessThanOrEqual(neurons.length);
  });

  it('never repeats a fragment', () => {
    for (const mode of ['vector', 'lexical', 'hybrid'] as const) {
      const ids = rankBy(mode, vec, query.question.es, 'es').map((n) => n.node.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe('evaluation', () => {
  const result = evaluate();

  it('covers every question in every language', () => {
    expect(result.cases).toBe(embeddedQueries.length * LANGS.length);
    expect(Object.keys(result.byLang)).toEqual(LANGS);
  });

  it('keeps every score between zero and one', () => {
    for (const row of [...result.overall, ...Object.values(result.byLang).flat()]) {
      expect(row.recall).toBeGreaterThanOrEqual(0);
      expect(row.recall).toBeLessThanOrEqual(1);
      expect(row.mrr).toBeGreaterThanOrEqual(0);
      expect(row.mrr).toBeLessThanOrEqual(1);
    }
  });

  it('shows what the site promises: hybrid retrieval brings back every cited source', () => {
    const hybrid = result.overall.find((row) => row.mode === 'hybrid')!;
    expect(hybrid.recall).toBe(1);
  });
});

describe('free-text search', () => {
  it('finds a fragment by a word of its own, in each language', () => {
    expect(searchText('reranker', 'en')!.final.map((s) => s.item.node.id)).toContain(
      'proj-sangi-eval',
    );
    expect(searchText('cuantización', 'es')!.final[0]!.item.node.id).toBe('emb-quantization');
    expect(searchText('量子化', 'ja')!.final[0]!.item.node.id).toBe('emb-quantization');
  });

  it('widens the search with neighbours in meaning that share no word with the query', () => {
    const result = searchText('quantization', 'en')!;
    const byWords = new Set(result.lexical.map((s) => s.item.node.id));
    expect(result.vector).toHaveLength(8);
    expect(result.vector.some((s) => !byWords.has(s.item.node.id))).toBe(true);
    expect(result.final).toHaveLength(FINAL_K);
  });

  it('says so when nothing matches', () => {
    expect(searchText('zzzz qqqq', 'en')).toBeNull();
    expect(searchText('   ', 'en')).toBeNull();
  });
});
