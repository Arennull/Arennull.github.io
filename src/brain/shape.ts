/**
 * Procedural brain made of points: two hemispheres with folds, a cerebellum
 * and a stem. No 3D asset involved. +x is the front, +y is up.
 */
export interface Cortex {
  positions: Float32Array;
  /** 0 in the depth of a fold, 1 on the crest. Drives brightness. */
  shade: Float32Array;
  seeds: Float32Array;
}

function unitDirection(random: () => number): [number, number, number] {
  const u = random() * 2 - 1;
  const phi = random() * Math.PI * 2;
  const r = Math.sqrt(1 - u * u);
  return [r * Math.cos(phi), u, r * Math.sin(phi)];
}

function fold(x: number, y: number, z: number): number {
  const a = Math.sin(11 * x + 4 * Math.sin(7 * y + z * 3));
  const b = Math.sin(9 * y + 4 * Math.sin(6 * z + x * 2));
  const c = Math.sin(13 * z + 5 * Math.sin(8 * x));
  return (a * b + 0.6 * c) / 1.6;
}

export function generateCortex(count: number, random: () => number): Cortex {
  const positions = new Float32Array(count * 3);
  const shade = new Float32Array(count);
  const seeds = new Float32Array(count);

  let i = 0;
  while (i < count) {
    const pick = random();
    let x: number;
    let y: number;
    let z: number;
    let s: number;

    if (pick < 0.84) {
      // Hemisphere.
      const side = random() < 0.5 ? -1 : 1;
      const [dx, dy, dz] = unitDirection(random);
      const depth = 1 - 0.1 * random() * random();
      x = 0.95 * dx * depth;
      y = 0.62 * dy * depth;
      z = 0.42 * dz * depth;
      if (y < 0) y *= 0.72; // flatter underside
      const taper = 1 - 0.16 * Math.max(0, x); // narrower frontal lobe
      y *= taper;
      z *= taper;
      z += side * 0.3;
      if (side * z < 0.035) continue; // keep the fissure between hemispheres open
      const f = fold(x, y, z);
      const push = 1 + 0.035 * f;
      x *= push;
      y *= push;
      z = side * 0.3 + (z - side * 0.3) * push;
      y += 0.08;
      s = 0.5 + 0.5 * f;
    } else if (pick < 0.96) {
      // Cerebellum: tight horizontal ridges.
      const [dx, dy, dz] = unitDirection(random);
      x = -0.56 + 0.3 * dx;
      y = -0.46 + 0.19 * dy;
      z = 0.44 * dz;
      s = 0.5 + 0.5 * Math.sin(70 * y + 6 * Math.sin(5 * z));
    } else {
      // Brain stem.
      const t = random();
      const angle = random() * Math.PI * 2;
      const radius = 0.085 * (1 - 0.25 * t);
      x = -0.3 - 0.1 * t + radius * Math.cos(angle);
      y = -0.42 - 0.5 * t;
      z = radius * Math.sin(angle);
      s = 0.35 + 0.3 * random();
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    shade[i] = s;
    seeds[i] = random();
    i++;
  }
  return { positions, shade, seeds };
}

/** Neuron layout comes as (width, height, length); the scene wants length on x. */
export function toScene(pos: [number, number, number]): [number, number, number] {
  return [pos[2], pos[1] + 0.08, pos[0] * 0.95];
}
