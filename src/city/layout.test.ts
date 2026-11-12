import { describe, expect, it } from 'vitest';
import { edges, neurons } from '../lib/brain';
import { CITY, LOT, PITCH, REACH, buildCity, hoverOver, route, towerTop } from './layout';

const lot = (t: { gx: number; gz: number }) => `${t.gx},${t.gz}`;

describe('city layout', () => {
  it('gives every fragment a lot of its own, inside the city', () => {
    expect(CITY.towers.map((t) => t.index)).toEqual(neurons.map((n) => n.index));
    expect(new Set(CITY.towers.map(lot)).size).toBe(neurons.length);
    for (const t of CITY.towers) {
      expect(Math.abs(t.gx)).toBeLessThanOrEqual(REACH);
      expect(Math.abs(t.gz)).toBeLessThanOrEqual(REACH);
    }
  });

  it('never builds an ordinary building on a tower or on the plaza', () => {
    const used = new Set(CITY.towers.map((t) => `${t.x},${t.z}`));
    used.add(`${CITY.plaza.x},${CITY.plaza.z}`);
    for (const f of CITY.fillers) {
      expect(used.has(`${f.x},${f.z}`)).toBe(false);
      expect(f.width).toBeLessThanOrEqual(LOT);
      expect(f.depth).toBeLessThanOrEqual(LOT);
    }
    expect(CITY.fillers.length).toBeGreaterThan(100);
  });

  it('is the same city every time', () => {
    expect(buildCity(neurons, edges)).toEqual(CITY);
  });

  it('keeps similar fragments in the same part of town', () => {
    const distance = (a: number, b: number) =>
      Math.hypot(CITY.towers[a]!.gx - CITY.towers[b]!.gx, CITY.towers[a]!.gz - CITY.towers[b]!.gz);
    const linked = edges.reduce((sum, [a, b]) => sum + distance(a, b), 0) / edges.length;
    let total = 0;
    let pairs = 0;
    for (let a = 0; a < neurons.length; a++) {
      for (let b = a + 1; b < neurons.length; b++) {
        total += distance(a, b);
        pairs += 1;
      }
    }
    expect(linked).toBeLessThan((total / pairs) * 0.6);
  });

  it('makes the best connected fragments the tallest towers', () => {
    const degree = neurons.map(() => 0);
    for (const [a, b] of edges) {
      degree[a]! += 1;
      degree[b]! += 1;
    }
    const most = degree.indexOf(Math.max(...degree));
    const least = degree.indexOf(Math.min(...degree));
    expect(CITY.towers[most]!.height).toBeGreaterThan(CITY.towers[least]!.height);
  });

  it('routes along streets: straight legs that stay off the lots', () => {
    for (const [a, b] of edges) {
      const from = CITY.towers[a]!;
      const to = CITY.towers[b]!;
      const points = route(from, to);
      expect(points[0]).toEqual([from.x, from.z]);
      expect(points.at(-1)).toEqual([to.x, to.z]);
      const [, start, corner, end] = points;
      expect(corner![1]).toBe(start![1]);
      expect(corner![0]).toBe(end![0]);
      // Streets run halfway between lots.
      for (const [x, z] of [start!, corner!, end!]) {
        expect(Math.abs((x / PITCH) % 1)).toBeCloseTo(0.5);
        expect(Math.abs((z / PITCH) % 1)).toBeCloseTo(0.5);
      }
    }
  });

  it('hovers a query above the towers it is closest to', () => {
    const [x, y, z] = hoverOver([0, 1, 2]);
    const tops = [0, 1, 2].map(towerTop);
    expect(x).toBeCloseTo((tops[0]![0] + tops[1]![0] + tops[2]![0]) / 3);
    expect(z).toBeCloseTo((tops[0]![2] + tops[1]![2] + tops[2]![2]) / 3);
    expect(y).toBeGreaterThan(Math.max(...CITY.towers.map((t) => t.height)));
  });
});
