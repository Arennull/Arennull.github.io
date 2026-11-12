import { edges, neurons } from '../lib/brain';
import { seeded } from '../lib/random';

/** Distance between the centres of two neighbouring lots; streets run halfway between them. */
export const PITCH = 0.3;
/** Side of a lot. What is left of the pitch is the street. */
export const LOT = 0.19;
/** The city is a square of lots from -REACH to REACH on both axes. */
export const REACH = 7;
/** Knowledge is spread over a slightly smaller rectangle, so it is ringed by ordinary buildings. */
const SPREAD_X = 6;
const SPREAD_Z = 5;

export interface Tower {
  /** Index of the knowledge fragment this tower stands for. */
  index: number;
  gx: number;
  gz: number;
  x: number;
  z: number;
  height: number;
}

/** A building that holds no knowledge: it is there to make the city a city. */
export interface Filler {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  /** 0–1, to vary its windows. */
  seed: number;
}

export interface City {
  towers: Tower[];
  fillers: Filler[];
  /** The one empty lot nearest the centre: a plaza. */
  plaza: { x: number; z: number };
  /** Size of the square the city covers, streets included. */
  size: number;
}

const key = (gx: number, gz: number) => `${gx},${gz}`;

/** Every lot, nearest to (gx, gz) first; ties are broken the same way every time. */
function nearestLots(gx: number, gz: number): [number, number][] {
  const all: [number, number, number][] = [];
  for (let x = -REACH; x <= REACH; x++) {
    for (let z = -REACH; z <= REACH; z++) all.push([x, z, (x - gx) ** 2 + (z - gz) ** 2]);
  }
  all.sort((a, b) => a[2] - b[2] || a[0] - b[0] || a[1] - b[1]);
  return all.map(([x, z]) => [x, z]);
}

/**
 * Turns the embedding layout into a street plan. Each fragment takes the lot
 * nearest to where its embedding puts it, so similar ideas end up as
 * neighbours; the more connected a fragment is, the taller its tower.
 */
export function buildCity(
  nodes: { pos: [number, number, number] }[],
  links: readonly (readonly [number, number, number])[],
  seed = 7,
): City {
  // The layout is longest along its third axis: that one runs east to west.
  const maxX = Math.max(...nodes.map((n) => Math.abs(n.pos[2]))) || 1;
  const maxZ = Math.max(...nodes.map((n) => Math.abs(n.pos[0]))) || 1;
  const degree = nodes.map(() => 0);
  for (const [a, b] of links) {
    degree[a]! += 1;
    degree[b]! += 1;
  }

  const taken = new Set<string>();
  const claim = (wantX: number, wantZ: number): [number, number] => {
    const free = nearestLots(wantX, wantZ).find(([gx, gz]) => !taken.has(key(gx, gz)));
    if (!free) throw new Error('The city has more fragments than lots.');
    taken.add(key(free[0], free[1]));
    return free;
  };

  const towers = nodes.map((node, index): Tower => {
    const [gx, gz] = claim(
      Math.round((node.pos[2] / maxX) * SPREAD_X),
      Math.round((node.pos[0] / maxZ) * SPREAD_Z),
    );
    const height = Math.min(1.7, 0.58 + 0.13 * degree[index]!);
    return { index, gx, gz, x: gx * PITCH, z: gz * PITCH, height };
  });

  const [plazaX, plazaZ] = claim(0, 0);

  const random = seeded(seed);
  const fillers: Filler[] = [];
  for (let gx = -REACH; gx <= REACH; gx++) {
    for (let gz = -REACH; gz <= REACH; gz++) {
      // Every lot draws its numbers, taken or not, so one change does not reshuffle the rest.
      const [chance, w, d, h, s] = [random(), random(), random(), random(), random()];
      if (taken.has(key(gx, gz)) || chance > 0.9) continue;
      // Lower towards the centre, so the towers that matter stand out; taller at the rim.
      const rim = Math.max(Math.abs(gx), Math.abs(gz)) / REACH;
      fillers.push({
        x: gx * PITCH,
        z: gz * PITCH,
        width: LOT * (0.7 + 0.3 * w),
        depth: LOT * (0.7 + 0.3 * d),
        height: 0.1 + h * (0.22 + 0.3 * rim * h),
        seed: s,
      });
    }
  }

  return {
    towers,
    fillers,
    plaza: { x: plazaX * PITCH, z: plazaZ * PITCH },
    size: (2 * REACH + 1) * PITCH,
  };
}

export const CITY = buildCity(neurons, edges);

/** Top of a tower: where its sign floats and where the hero stands. */
export function towerTop(index: number): [number, number, number] {
  const tower = CITY.towers[index]!;
  return [tower.x, tower.height, tower.z];
}

/**
 * The way from one tower to another along the streets, at ground level: out to
 * the corner of its own lot, along one street, down another, and in.
 */
export function route(from: Tower, to: Tower): [number, number][] {
  const half = PITCH / 2;
  const start: [number, number] = [from.x + half, from.z + half];
  const end: [number, number] = [to.x + half, to.z + half];
  return [[from.x, from.z], start, [end[0], start[1]], end, [to.x, to.z]];
}

/** Height at which a query hovers before it lands, above every roof. */
export const HOVER_HEIGHT = 2.1;

/** Where a query hovers: above the towers closest to it in meaning. */
export function hoverOver(indices: number[]): [number, number, number] {
  const tops = indices.map(towerTop);
  const mean = (d: 0 | 2) => tops.reduce((sum, p) => sum + p[d], 0) / Math.max(1, tops.length);
  return [mean(0), HOVER_HEIGHT, mean(2)];
}
