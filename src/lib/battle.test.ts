import { describe, expect, it } from 'vitest';
import { BATTLES, startBattle, strike } from './battle';

describe('strike', () => {
  it('hurts the enemy with hits and the hero with misses', () => {
    expect(strike(startBattle('retriever'), 2, 1)).toEqual({ enemy: 3, hero: 4, status: 'fight' });
  });

  it('wins on the finishing blow even if the same turn had misses', () => {
    const last = { enemy: 1, hero: 1, status: 'fight' } as const;
    expect(strike(last, 1, 2)).toEqual({ enemy: 0, hero: 1, status: 'won' });
  });

  it('loses when the hero runs out of hit points', () => {
    expect(strike(startBattle('closer'), 0, 3).status).toBe('lost');
  });

  it('ignores turns after the battle is over', () => {
    const over = strike(startBattle('chunking'), 3, 0);
    expect(strike(over, 0, 9)).toBe(over);
  });

  it('always decides the retriever battle within its three rounds of three picks', () => {
    const { enemy, hero } = BATTLES.retriever;
    expect(enemy + hero).toBeLessThanOrEqual(3 * 3 + 1);
  });
});
