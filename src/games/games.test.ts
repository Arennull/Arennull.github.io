import { describe, expect, it } from 'vitest';
import { CHUNK_OVERLAPS, CHUNK_SIZES, chunkingQuestions } from '../../content/games';
import { LANGS } from '../lib/types';
import { seeded } from '../lib/random';
import { runLab } from './ChunkingLab';
import { makeDuel } from './CloserFarther';
import { buildRounds } from './RetrieverGame';

describe('Be the retriever', () => {
  const rounds = buildRounds(7);

  it('deals three different questions with eight unique candidates each', () => {
    expect(new Set(rounds.map((r) => r.queryIndex)).size).toBe(3);
    for (const round of rounds) {
      expect(new Set(round.candidates.map((c) => c.item.node.id)).size).toBe(8);
    }
  });

  it('always includes the real top three, and they outrank every distractor', () => {
    for (const round of rounds) {
      const sorted = [...round.candidates].sort((a, b) => b.score - a.score);
      expect(sorted.slice(0, 3).map((c) => c.item.node.id)).toEqual(round.top);
    }
  });

  it('is reproducible for a given seed', () => {
    expect(buildRounds(7)).toEqual(rounds);
  });
});

describe('Chunking lab', () => {
  it('ranks every chunk exactly once for every setting', () => {
    for (const lang of LANGS) {
      for (const size of CHUNK_SIZES) {
        for (const overlap of CHUNK_OVERLAPS) {
          for (const q of chunkingQuestions) {
            const { chunks, answerRank } = runLab(lang, size, overlap, q.id);
            const ranks = chunks.map((c) => c.rank).sort((a, b) => a - b);
            expect(ranks).toEqual(chunks.map((_, i) => i + 1));
            expect(answerRank).toBeLessThanOrEqual(chunks.length);
          }
        }
      }
    }
  });

  it('shows the lesson: the default question is cut without overlap and found with it', () => {
    const question = chunkingQuestions[1]!.id;
    expect(runLab('en', 200, 0, question).answerRank).toBe(0);
    expect(runLab('en', 200, 0.3, question).answerRank).toBe(1);
  });

  it.each(LANGS)('teaches the same lesson in %s: some size needs the overlap', (lang) => {
    const question = chunkingQuestions[1]!.id;
    const rescued = CHUNK_SIZES.filter(
      (size) =>
        runLab(lang, size, 0, question).answerRank === 0 &&
        runLab(lang, size, 0.3, question).answerRank === 1,
    );
    expect(rescued.length).toBeGreaterThan(0);
  });

  it.each(LANGS)('can be won in %s: every question has a setting that finds it', (lang) => {
    for (const q of chunkingQuestions) {
      const ranks = CHUNK_SIZES.flatMap((size) =>
        CHUNK_OVERLAPS.map((overlap) => runLab(lang, size, overlap, q.id).answerRank),
      );
      expect(ranks).toContain(1);
    }
  });
});

describe('Closer or farther', () => {
  it('never builds an ambiguous or degenerate duel', () => {
    const random = seeded(3);
    for (let i = 0; i < 200; i++) {
      const duel = makeDuel(random);
      const ids = [duel.anchor, ...duel.options].map((c) => c.concept.id);
      expect(new Set(ids).size).toBe(3);
      expect(Math.abs(duel.scores[0] - duel.scores[1])).toBeGreaterThanOrEqual(0.08);
    }
  });
});
