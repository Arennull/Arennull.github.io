import { knowledge } from '../../content/knowledge';
import { edges, neurons } from './brain';
import type { BattleId, Progress } from './progress';

const inCluster = (cluster: string) =>
  knowledge.filter((k) => k.cluster === cluster).map((k) => k.id);

/**
 * Towers that give an enemy away. Finding any one of them tells the hero what
 * it is weak to: the knowledge in the city is what wins the fights.
 */
export const INTEL: Record<BattleId, string[]> = {
  // A query that shares no words with its answer is found by meaning.
  retriever: inCluster('embeddings'),
  // Text cut in half is saved by overlap.
  chunking: ['rag-chunking'],
  // Two things alike in meaning are told apart by an exact word.
  closer: ['rag-hybrid'],
  // A claim with no source falls to citations.
  boss: ['eval-hallucination'],
};

export function knowsWeakness(progress: Progress, id: BattleId): boolean {
  return INTEL[id].some((tower) => progress.discovered.includes(tower));
}

/**
 * Towers the hero has seen from the ones already visited: their names show,
 * though they still have to be visited to count as discovered.
 */
export function sighted(discovered: ReadonlySet<number>): Set<number> {
  const seen = new Set<number>();
  for (const [a, b] of edges) {
    if (discovered.has(a)) seen.add(b);
    if (discovered.has(b)) seen.add(a);
  }
  for (const index of discovered) seen.delete(index);
  return seen;
}

export const TOWER_COUNT = neurons.length;
