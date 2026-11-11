import type { BattleId } from './progress';

export interface BattleState {
  enemy: number;
  hero: number;
  status: 'fight' | 'won' | 'lost';
}

/** Hit points each side starts with. */
export const BATTLES: Record<BattleId, { enemy: number; hero: number }> = {
  retriever: { enemy: 5, hero: 5 },
  chunking: { enemy: 3, hero: 4 },
  closer: { enemy: 5, hero: 3 },
  boss: { enemy: 6, hero: 3 },
};

export const startBattle = (id: BattleId): BattleState => ({ ...BATTLES[id], status: 'fight' });

/** One turn: right answers hurt the enemy, wrong ones hurt the hero. */
export function strike(state: BattleState, hits: number, misses: number): BattleState {
  if (state.status !== 'fight') return state;
  const enemy = Math.max(0, state.enemy - hits);
  // The hero strikes first: a finishing blow wins even if the same turn had misses.
  if (enemy === 0) return { ...state, enemy, status: 'won' };
  const hero = Math.max(0, state.hero - misses);
  return { enemy, hero, status: hero === 0 ? 'lost' : 'fight' };
}
