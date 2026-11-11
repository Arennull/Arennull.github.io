import { describe, expect, it } from 'vitest';
import { CHUNK_OVERLAPS, CHUNK_SIZES, concepts } from '../../content/games';
import { knowledge } from '../../content/knowledge';
import { queries } from '../../content/queries';
import {
  chunkingQuestions,
  chunkingText,
  dims,
  edges,
  embeddedConcepts,
  embeddedQueries,
  labChunks,
  neighbours,
  neuronById,
  neurons,
  retrieve,
  SEARCH_K,
} from './brain';
import { cosine } from './vector';

describe('brain.json is in sync with content/', () => {
  it('has one neuron per fragment, one vector per query and concept', () => {
    expect(neurons.map((n) => n.node.id)).toEqual(knowledge.map((k) => k.id));
    expect(embeddedQueries.map((q) => q.query.id)).toEqual(queries.map((q) => q.id));
    expect(embeddedConcepts.map((c) => c.concept.id)).toEqual(concepts.map((c) => c.id));
    expect(neurons[0]!.vec).toHaveLength(dims);
  });

  it('has precomputed vectors for every chunking setting', () => {
    for (const lang of ['en', 'es'] as const) {
      for (const size of CHUNK_SIZES) {
        for (const overlap of CHUNK_OVERLAPS) {
          expect(labChunks(lang, size, overlap).length).toBeGreaterThan(0);
        }
      }
      for (const q of chunkingQuestions) {
        expect(chunkingText[lang]).toContain(q.answer[lang]);
      }
    }
  });

  it('keeps neurons inside the brain volume and edges valid', () => {
    for (const n of neurons) {
      expect(Math.hypot(n.pos[0] / 0.6, n.pos[1] / 0.4, n.pos[2] / 0.74)).toBeLessThanOrEqual(1.01);
    }
    for (const [a, b, sim] of edges) {
      expect(a).toBeLessThan(b);
      expect(neurons[b]).toBeDefined();
      expect(sim).toBeGreaterThan(0);
    }
  });
});

describe('retrieval sanity', () => {
  const cases = embeddedQueries.flatMap((q) =>
    (['en', 'es'] as const).map((lang) => [q.query.id, lang, q] as const),
  );

  it.each(cases)('%s (%s) hands the answer the fragments it cites', (_id, lang, { query, vec }) => {
    const { vector, final } = retrieve(vec, query.question[lang], lang);
    expect(vector).toHaveLength(SEARCH_K);
    const sources = final.map((c) => c.item.node.id);
    for (const cite of query.cites) expect(sources).toContain(cite);
  });

  it('places related ideas closer than unrelated ones', () => {
    const vec = (id: string) => neuronById(id).vec;
    expect(cosine(vec('rag-hybrid'), vec('rag-rrf'))).toBeGreaterThan(
      cosine(vec('rag-hybrid'), vec('about-stack')),
    );
  });

  it('never lists a neuron as its own neighbour', () => {
    const first = neurons[0]!;
    expect(neighbours(first).every((n) => n.item.index !== first.index)).toBe(true);
  });
});
