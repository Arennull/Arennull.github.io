import { describe, expect, it } from 'vitest';
import { edges, neuronById } from './brain';
import { INTEL, knowsWeakness, sighted } from './intel';
import { EMPTY_PROGRESS } from './progress';

describe('intel', () => {
  it('points every enemy at towers that exist', () => {
    for (const towers of Object.values(INTEL)) {
      expect(towers.length).toBeGreaterThan(0);
      for (const id of towers) expect(() => neuronById(id)).not.toThrow();
    }
  });

  it('gives a weakness away only once one of its towers is found', () => {
    expect(knowsWeakness(EMPTY_PROGRESS, 'boss')).toBe(false);
    const found = { ...EMPTY_PROGRESS, discovered: ['eval-hallucination'] };
    expect(knowsWeakness(found, 'boss')).toBe(true);
    expect(knowsWeakness(found, 'chunking')).toBe(false);
  });
});

describe('sighted', () => {
  it('names the neighbours of visited towers, and never the visited ones', () => {
    const [a, b] = edges[0]!;
    const seen = sighted(new Set([a]));
    expect(seen.has(b)).toBe(true);
    expect(seen.has(a)).toBe(false);
    expect(sighted(new Set()).size).toBe(0);
  });
});
