import { chunkChars, chunkingQuestions, chunkingText, concepts } from '../../content/games';
import { knowledge } from '../../content/knowledge';
import { queries } from '../../content/queries';
import raw from '../data/brain.json';
import { chunkText, type Chunk } from './chunker';
import { LANGS } from './types';
import type { BrainData, Concept, KnowledgeNode, Lang, PreparedQuery } from './types';
import { buildLexicalIndex, rrf, type LexicalIndex } from './lexical';
import { decodeVec, meanVec, rank, topK, type Scored, type Vec } from './vector';

const data = raw as unknown as BrainData;

export interface Neuron {
  index: number;
  node: KnowledgeNode;
  pos: [number, number, number];
  vec: Vec;
}

function byId<T extends { id: string }>(items: T[], id: string, what: string): T {
  const found = items.find((item) => item.id === id);
  if (!found) throw new Error(`brain.json is stale: unknown ${what} "${id}". Run build:brain.`);
  return found;
}

export const dims = data.dims;

export const neurons: Neuron[] = data.nodes.map((n, index) => ({
  index,
  node: byId(knowledge, n.id, 'fragment'),
  pos: n.pos,
  vec: decodeVec(n.vec),
}));

export const edges = data.edges;

export function neuronById(id: string): Neuron {
  const found = neurons.find((n) => n.node.id === id);
  if (!found) throw new Error(`Unknown neuron "${id}"`);
  return found;
}

export interface EmbeddedQuery {
  query: PreparedQuery;
  vec: Vec;
}

export const embeddedQueries: EmbeddedQuery[] = data.queries.map((q) => ({
  query: byId(queries, q.id, 'query'),
  vec: decodeVec(q.vec),
}));

export interface EmbeddedConcept {
  concept: Concept;
  vec: Vec;
}

export const embeddedConcepts: EmbeddedConcept[] = data.concepts.map((c) => ({
  concept: byId(concepts, c.id, 'concept'),
  vec: decodeVec(c.vec),
}));

export const SEARCH_K = 8;
export const FINAL_K = 5;

export interface Retrieval {
  /** Top SEARCH_K by cosine similarity against the query embedding. */
  vector: Scored<Neuron>[];
  /** Top SEARCH_K by BM25 over the fragment text in the visitor's language. */
  lexical: Scored<Neuron>[];
  /** Both lists merged by reciprocal rank fusion. */
  fused: Scored<Neuron>[];
  /** The FINAL_K fused results handed to the answer as sources. */
  final: Scored<Neuron>[];
}

const vecOf = (n: Neuron) => n.vec;

const lexicalIndexes = Object.fromEntries(
  LANGS.map((lang) => [
    lang,
    buildLexicalIndex(neurons, (n) => `${n.node.title[lang]} ${n.node.text[lang]}`),
  ]),
) as Record<Lang, LexicalIndex<Neuron>>;

/** Hybrid retrieval: vector search and keyword search, fused by rank. */
export function retrieve(queryVec: Vec, queryText: string, lang: Lang): Retrieval {
  const vector = topK(queryVec, neurons, vecOf, SEARCH_K);
  const lexical = lexicalIndexes[lang].search(queryText, SEARCH_K);
  const fused = rrf([vector.map((s) => s.item), lexical.map((s) => s.item)], (n) => n.node.id);
  return { vector, lexical, fused, final: fused.slice(0, FINAL_K) };
}

export function rankNeurons(queryVec: Vec): Scored<Neuron>[] {
  return rank(queryVec, neurons, vecOf);
}

export type Mode = 'vector' | 'lexical' | 'hybrid';
export const MODES: Mode[] = ['vector', 'lexical', 'hybrid'];

/** Fragments ranked one way only, best first: what each half finds, and what both find together. */
export function rankBy(mode: Mode, queryVec: Vec, queryText: string, lang: Lang): Neuron[] {
  if (mode === 'vector') return rankNeurons(queryVec).map((s) => s.item);
  if (mode === 'lexical') {
    return lexicalIndexes[lang].search(queryText, neurons.length).map((s) => s.item);
  }
  return retrieve(queryVec, queryText, lang).fused.map((s) => s.item);
}

/** How many keyword hits lend their vectors to a query that has none of its own. */
const FEEDBACK_K = 3;

/**
 * Search for text nobody embedded beforehand. There is no model in the browser
 * to turn it into a vector, so the best keyword hits stand in for it: their
 * mean vector is the query (pseudo-relevance feedback), and from there on it is
 * the same hybrid retrieval. Null when no word of the text is known.
 */
export function searchText(text: string, lang: Lang): Retrieval | null {
  const seeds = lexicalIndexes[lang].search(text, FEEDBACK_K);
  if (seeds.length === 0) return null;
  return retrieve(meanVec(seeds.map((s) => s.item.vec)), text, lang);
}

export function neighbours(neuron: Neuron, k = 4): Scored<Neuron>[] {
  return rank(neuron.vec, neurons, vecOf)
    .filter((s) => s.item.index !== neuron.index)
    .slice(0, k);
}

export interface LabChunk extends Chunk {
  vec: Vec;
}

export function labChunks(lang: Lang, size: number, overlap: number): LabChunk[] {
  const config = data.chunking[lang].configs.find((c) => c.size === size && c.overlap === overlap);
  if (!config) throw new Error(`No precomputed chunking for size ${size}, overlap ${overlap}`);
  const chunks = chunkText(chunkingText[lang], chunkChars(lang, size), overlap);
  if (chunks.length !== config.vecs.length) {
    throw new Error('brain.json is stale: chunk count changed. Run build:brain.');
  }
  return chunks.map((chunk, i) => ({ ...chunk, vec: decodeVec(config.vecs[i]!) }));
}

export function labQuestionVec(lang: Lang, id: string): Vec {
  return decodeVec(byId(data.chunking[lang].questions, id, 'lab question').vec);
}

export { chunkingQuestions, chunkingText };
