/**
 * Builds src/data/brain.json: embeds every knowledge fragment, prepared query,
 * game concept and lab chunk, links nearest neighbours and projects to 3D.
 *
 * Run with `npm run build:brain` after editing anything under content/.
 * The first run downloads the embedding model (~120 MB) into the local cache.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pipeline } from '@huggingface/transformers';
import { UMAP } from 'umap-js';
import {
  CHUNK_OVERLAPS,
  CHUNK_SIZES,
  chunkingQuestions,
  chunkingText,
  concepts,
} from '../content/games';
import { knowledge } from '../content/knowledge';
import { queries } from '../content/queries';
import { chunkText } from '../src/lib/chunker';
import { seeded } from '../src/lib/random';
import type { BrainData, Lang } from '../src/lib/types';
import { cosine, encodeVec, meanVec, normalize, type Vec } from '../src/lib/vector';

const MODEL = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
const NEIGHBOURS = 3;
/** Half-axes of the volume the neurons are packed into (x, y, z). */
const BRAIN_AXES = [0.6, 0.4, 0.74] as const;
const LANGS: Lang[] = ['en', 'es'];

const extractor = await pipeline('feature-extraction', MODEL, { dtype: 'q8' });

async function embed(texts: string[]): Promise<Vec[]> {
  const out: Vec[] = [];
  for (let i = 0; i < texts.length; i += 16) {
    const batch = texts.slice(i, i + 16);
    const tensor = await extractor(batch, { pooling: 'mean', normalize: true });
    for (const row of tensor.tolist() as number[][]) out.push(normalize(row));
  }
  return out;
}

/** One vector per item: the mean of its English and Spanish embeddings. */
async function embedBilingual(items: { en: string; es: string }[]): Promise<Vec[]> {
  const en = await embed(items.map((i) => i.en));
  const es = await embed(items.map((i) => i.es));
  return en.map((v, i) => meanVec([v, es[i]!]));
}

console.log(`Embedding ${knowledge.length} fragments…`);
const nodeVecs = await embedBilingual(
  knowledge.map((n) => ({
    en: `${n.title.en}. ${n.text.en}`,
    es: `${n.title.es}. ${n.text.es}`,
  })),
);

// Nearest-neighbour edges.
const edgeMap = new Map<string, [number, number, number]>();
nodeVecs.forEach((v, i) => {
  nodeVecs
    .map((other, j) => ({ j, sim: j === i ? -1 : cosine(v, other) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, NEIGHBOURS)
    .forEach(({ j, sim }) => {
      const [a, b] = i < j ? [i, j] : [j, i];
      edgeMap.set(`${a}-${b}`, [a, b, Math.round(sim * 1000) / 1000]);
    });
});

// 3D layout.
const umap = new UMAP({
  nComponents: 3,
  nNeighbors: 8,
  minDist: 0.45,
  spread: 1.2,
  random: seeded(1887),
});
const raw = umap.fit(nodeVecs.map((v) => Array.from(v)));
const centre = [0, 1, 2].map((d) => raw.reduce((s, p) => s + p[d]!, 0) / raw.length);
const centred = raw.map((p) => p.map((x, d) => x - centre[d]!));
const maxRadius = Math.max(...centred.map((p) => Math.hypot(p[0]!, p[1]!, p[2]!)));
// UMAP packs most points near the centre; a square root on the radius spreads them out.
const positions = centred.map(
  (p) =>
    p.map((x, d) => {
      const radius = Math.hypot(p[0]!, p[1]!, p[2]!) / maxRadius || 1;
      return (
        Math.round((x / maxRadius) * (Math.sqrt(radius) / radius) * BRAIN_AXES[d]! * 1000) / 1000
      );
    }) as [number, number, number],
);

console.log('Embedding queries, concepts and lab chunks…');
const queryVecs = await embedBilingual(queries.map((q) => q.question));
const conceptVecs = await embedBilingual(concepts.map((c) => c.label));

const chunking = {} as BrainData['chunking'];
for (const lang of LANGS) {
  const configs = [];
  for (const size of CHUNK_SIZES) {
    for (const overlap of CHUNK_OVERLAPS) {
      const chunks = chunkText(chunkingText[lang], size, overlap);
      const vecs = await embed(chunks.map((c) => c.text));
      configs.push({ size, overlap, vecs: vecs.map(encodeVec) });
    }
  }
  const questionVecs = await embed(chunkingQuestions.map((q) => q.question[lang]));
  chunking[lang] = {
    configs,
    questions: chunkingQuestions.map((q, i) => ({ id: q.id, vec: encodeVec(questionVecs[i]!) })),
  };
}

const data: BrainData = {
  model: MODEL,
  dims: nodeVecs[0]!.length,
  nodes: knowledge.map((n, i) => ({ id: n.id, pos: positions[i]!, vec: encodeVec(nodeVecs[i]!) })),
  edges: [...edgeMap.values()],
  queries: queries.map((q, i) => ({ id: q.id, vec: encodeVec(queryVecs[i]!) })),
  concepts: concepts.map((c, i) => ({ id: c.id, vec: encodeVec(conceptVecs[i]!) })),
  chunking,
};

const target = fileURLToPath(new URL('../src/data/brain.json', import.meta.url));
writeFileSync(target, JSON.stringify(data));
console.log(
  `Wrote ${target}: ${data.nodes.length} nodes, ${data.edges.length} edges, ${data.dims} dims.`,
);
