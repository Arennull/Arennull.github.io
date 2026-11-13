import { describe, expect, it } from 'vitest';
import {
  applyEvent,
  bossUnlocked,
  EMPTY_PROGRESS,
  LEVELS,
  levelOf,
  objectivesOf,
  parseProgress,
  xpOf,
  type Progress,
  type ProgressEvent,
} from './progress';

const play = (...events: ProgressEvent[]): Progress => events.reduce(applyEvent, EMPTY_PROGRESS);

describe('XP', () => {
  it('pays once per neuron, question and quest', () => {
    const p = play(
      { type: 'discover', ids: ['a', 'b'] },
      { type: 'discover', ids: ['b', 'c'] },
      { type: 'ask', id: 'q' },
      { type: 'ask', id: 'q' },
      { type: 'quest', id: 's' },
      { type: 'quest', id: 's' },
    );
    expect(p.discovered).toEqual(['a', 'b', 'c']);
    expect(xpOf(p)).toBe(3 * 10 + 30 + 40);
  });

  it('keeps the best trial score and caps it', () => {
    const p = play(
      { type: 'trial', id: 'closer', score: 3 },
      { type: 'trial', id: 'closer', score: 1 },
      { type: 'trial', id: 'retriever', score: 99 },
    );
    expect(p.trials).toEqual({ closer: 3, retriever: 9 });
    expect(xpOf(p)).toBe(3 * 15 + 9 * 10);
  });

  it('returns the same object when nothing was gained', () => {
    const p = play({ type: 'trial', id: 'chunking', score: 2 }, { type: 'recruit' });
    expect(applyEvent(p, { type: 'trial', id: 'chunking', score: 2 })).toBe(p);
    expect(applyEvent(p, { type: 'recruit' })).toBe(p);
  });
});

describe('levels', () => {
  it('starts at level 1 and reports progress to the next', () => {
    expect(levelOf(0)).toEqual({ level: 1, next: 60, fraction: 0 });
    expect(levelOf(30).fraction).toBeCloseTo(0.5);
    expect(levelOf(60).level).toBe(2);
  });

  it('tops out at the last level', () => {
    expect(levelOf(99999)).toEqual({ level: LEVELS.length, next: null, fraction: 1 });
  });

  it('can be completed: playing everything reaches the last level', () => {
    const everything = play(
      { type: 'discover', ids: Array.from({ length: 41 }, (_, i) => `n${i}`) },
      ...Array.from({ length: 8 }, (_, i) => ({ type: 'ask', id: `q${i}` }) as const),
      ...Array.from({ length: 6 }, (_, i) => ({ type: 'quest', id: `p${i}` }) as const),
      { type: 'trial', id: 'retriever', score: 9 },
      { type: 'trial', id: 'chunking', score: 3 },
      { type: 'trial', id: 'closer', score: 5 },
      { type: 'win', id: 'boss' },
      { type: 'recruit' },
    );
    expect(levelOf(xpOf(everything)).level).toBe(LEVELS.length);
  });
});

describe('objectives', () => {
  it('tick as the visitor plays', () => {
    expect(Object.values(objectivesOf(EMPTY_PROGRESS)).some(Boolean)).toBe(false);
    const p = play(
      { type: 'discover', ids: ['1', '2', '3', '4', '5', '6', '7', '8'] },
      { type: 'win', id: 'closer' },
    );
    expect(objectivesOf(p)).toEqual({
      explore: true,
      ask: false,
      battle: true,
      quest: false,
      train: false,
      boss: false,
      recruit: false,
    });
  });
});

describe('battles', () => {
  it('pay once per enemy', () => {
    const once = play({ type: 'win', id: 'closer' });
    expect(xpOf(once)).toBe(40);
    expect(applyEvent(once, { type: 'win', id: 'closer' })).toBe(once);
  });

  it('unlock the boss only after the three guardians fall', () => {
    const two = play({ type: 'win', id: 'retriever' }, { type: 'win', id: 'chunking' });
    expect(bossUnlocked(two)).toBe(false);
    expect(bossUnlocked(applyEvent(two, { type: 'win', id: 'closer' }))).toBe(true);
  });
});

describe('parseProgress', () => {
  it('round-trips a saved game', () => {
    const p = play(
      { type: 'discover', ids: ['a'] },
      { type: 'trial', id: 'closer', score: 2 },
      { type: 'win', id: 'closer' },
    );
    expect(parseProgress(JSON.stringify(p))).toEqual(p);
  });

  it('starts over on garbage instead of crashing', () => {
    expect(parseProgress(null)).toEqual(EMPTY_PROGRESS);
    expect(parseProgress('{oops')).toEqual(EMPTY_PROGRESS);
    expect(
      parseProgress(
        '{"discovered":[1,"a"],"trials":{"closer":"x","hack":5},"wins":["dragon","toString"]}',
      ),
    ).toEqual({
      ...EMPTY_PROGRESS,
      discovered: ['a'],
    });
  });
});
