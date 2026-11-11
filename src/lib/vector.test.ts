import { describe, expect, it } from 'vitest';
import { cosine, decodeVec, encodeVec, meanVec, normalize, rank, topK } from './vector';

const v = (...xs: number[]) => normalize(xs);

describe('cosine', () => {
  it('is 1 for the same direction and 0 for orthogonal vectors', () => {
    expect(cosine(v(1, 2, 3), v(2, 4, 6))).toBeCloseTo(1, 6);
    expect(cosine(v(1, 0), v(0, 1))).toBeCloseTo(0, 6);
    expect(cosine(v(1, 0), v(-1, 0))).toBeCloseTo(-1, 6);
  });

  it('returns 0 instead of NaN for a zero vector', () => {
    expect(cosine(new Float32Array([0, 0]), v(1, 0))).toBe(0);
  });
});

describe('quantization', () => {
  it('keeps cosine within 1% after an 8-bit round trip', () => {
    const a = v(0.12, -0.5, 0.33, 0.9, -0.07, 0.41);
    const b = v(0.3, 0.1, -0.2, 0.8, 0.05, -0.6);
    const before = cosine(a, b);
    const after = cosine(decodeVec(encodeVec(a)), decodeVec(encodeVec(b)));
    expect(Math.abs(before - after)).toBeLessThan(0.01);
  });

  it('decodes to a unit vector', () => {
    const d = decodeVec(encodeVec(v(3, -4, 12)));
    expect(Math.hypot(...d)).toBeCloseTo(1, 5);
  });
});

describe('ranking', () => {
  const items = [
    { id: 'far', vec: v(0, 1) },
    { id: 'near', vec: v(1, 0.1) },
    { id: 'mid', vec: v(1, 1) },
  ];

  it('orders by similarity, best first', () => {
    const ids = rank(v(1, 0), items, (i) => i.vec).map((s) => s.item.id);
    expect(ids).toEqual(['near', 'mid', 'far']);
  });

  it('topK truncates', () => {
    expect(topK(v(1, 0), items, (i) => i.vec, 2)).toHaveLength(2);
  });
});

describe('meanVec', () => {
  it('lands between its inputs, on the unit sphere', () => {
    const m = meanVec([v(1, 0), v(0, 1)]);
    expect(m[0]).toBeCloseTo(m[1]!, 6);
    expect(Math.hypot(...m)).toBeCloseTo(1, 6);
  });
});
