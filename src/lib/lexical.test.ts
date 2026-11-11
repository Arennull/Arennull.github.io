import { describe, expect, it } from 'vitest';
import { buildLexicalIndex, rrf, tokenize } from './lexical';

describe('tokenize', () => {
  it('strips accents, stopwords and word endings', () => {
    expect(tokenize('¿Cómo evalúas la recuperación?')).toEqual(['evalu', 'recup']);
    expect(tokenize('How do you evaluate a retriever?')).toEqual(['evalu', 'retri']);
  });
});

describe('BM25', () => {
  const docs = [
    { id: 'shoes', text: 'An archive of designer footwear and sneakers' },
    { id: 'coach', text: 'A fitness coach that remembers every client' },
    { id: 'crm', text: 'Meeting briefs inside a CRM, with a fitness of purpose' },
  ];
  const index = buildLexicalIndex(docs, (d) => d.text);

  it('finds the document that shares the rare word', () => {
    expect(index.search('designer sneakers', 3).map((s) => s.item.id)).toEqual(['shoes']);
  });

  it('ranks the document with more matching terms first', () => {
    expect(index.search('fitness coach', 3).map((s) => s.item.id)).toEqual(['coach', 'crm']);
  });

  it('returns nothing when no term matches', () => {
    expect(index.search('quantum', 3)).toEqual([]);
  });
});

describe('rrf', () => {
  it('rewards items that both lists agree on', () => {
    const fused = rrf(
      [
        ['a', 'b', 'c'],
        ['c', 'b', 'd'],
      ],
      (x) => x,
    ).map((s) => s.item);
    expect(fused.slice(0, 2).sort()).toEqual(['b', 'c']);
    expect(fused).toHaveLength(4);
  });

  it('keeps the order of a single list', () => {
    expect(rrf([['x', 'y', 'z']], (x) => x).map((s) => s.item)).toEqual(['x', 'y', 'z']);
  });
});
