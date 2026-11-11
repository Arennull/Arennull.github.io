export type Vec = Float32Array;

export function normalize(v: ArrayLike<number>): Vec {
  let sum = 0;
  for (let i = 0; i < v.length; i++) sum += v[i]! * v[i]!;
  const norm = Math.sqrt(sum) || 1;
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i]! / norm;
  return out;
}

export function dot(a: Vec, b: Vec): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i]! * b[i]!;
  return sum;
}

/** Cosine similarity. Safe for vectors that are not unit length. */
export function cosine(a: Vec, b: Vec): number {
  const na = Math.sqrt(dot(a, a));
  const nb = Math.sqrt(dot(b, b));
  if (na === 0 || nb === 0) return 0;
  return dot(a, b) / (na * nb);
}

/** Average of several vectors, back on the unit sphere. */
export function meanVec(vs: Vec[]): Vec {
  const first = vs[0];
  if (!first) throw new Error('meanVec needs at least one vector');
  const out = new Float32Array(first.length);
  for (const v of vs) for (let i = 0; i < v.length; i++) out[i] = out[i]! + v[i]!;
  return normalize(out);
}

const toBase64 = (bytes: Uint8Array): string => {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};

const fromBase64 = (b64: string): Uint8Array => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

/**
 * 8-bit scalar quantization: every dimension of a unit vector is scaled by the
 * largest absolute component and stored as one signed byte. Cosine only depends
 * on direction, so the scale does not need to be kept.
 */
export function encodeVec(v: Vec): string {
  let max = 0;
  for (const x of v) max = Math.max(max, Math.abs(x));
  const scale = max === 0 ? 0 : 127 / max;
  const bytes = new Uint8Array(v.length);
  for (let i = 0; i < v.length; i++) bytes[i] = Math.round(v[i]! * scale) & 0xff;
  return toBase64(bytes);
}

export function decodeVec(b64: string): Vec {
  const bytes = fromBase64(b64);
  const signed = new Int8Array(bytes.buffer, bytes.byteOffset, bytes.length);
  return normalize(signed);
}

export interface Scored<T> {
  item: T;
  score: number;
}

export function rank<T>(query: Vec, items: T[], vecOf: (item: T) => Vec): Scored<T>[] {
  return items
    .map((item) => ({ item, score: cosine(query, vecOf(item)) }))
    .sort((a, b) => b.score - a.score);
}

export function topK<T>(query: Vec, items: T[], vecOf: (item: T) => Vec, k: number): Scored<T>[] {
  return rank(query, items, vecOf).slice(0, k);
}
