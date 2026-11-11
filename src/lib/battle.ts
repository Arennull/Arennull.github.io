import type { BattleId } from './progress';

/** The hero's four techniques. Each enemy is weak to one and shrugs off another. */
export type MoveId = 'vector' | 'keyword' | 'overlap' | 'cite';
export const MOVE_IDS: MoveId[] = ['vector', 'keyword', 'overlap', 'cite'];

export type Action = { type: 'move'; move: MoveId } | { type: 'guard' } | { type: 'tea' };

export const HERO_HP = 30;
export const TEAS = 2;
export const TEA_HEAL = 12;
const MOVE_POWER = 5;
const COUNTER_DAMAGE = 8;
/** Every third enemy turn is a heavy blow, announced one turn ahead. */
const HEAVY_EVERY = 3;

interface Enemy {
  hp: number;
  attack: number;
  heavy: number;
  weak: MoveId;
  resists: MoveId;
}

export const BATTLES: Record<BattleId, Enemy> = {
  retriever: { hp: 26, attack: 3, heavy: 6, weak: 'vector', resists: 'keyword' },
  chunking: { hp: 30, attack: 3, heavy: 7, weak: 'overlap', resists: 'cite' },
  closer: { hp: 30, attack: 4, heavy: 8, weak: 'keyword', resists: 'vector' },
  boss: { hp: 54, attack: 5, heavy: 11, weak: 'cite', resists: 'overlap' },
};

export interface BattleState {
  id: BattleId;
  hero: number;
  enemy: number;
  teas: number;
  /** The last technique used: repeating it at once makes it weaker. */
  last: MoveId | null;
  /** Enemy turns taken so far. */
  turn: number;
  status: 'fight' | 'won' | 'lost';
}

type Step =
  | {
      kind: 'move';
      move: MoveId;
      damage: number;
      effect: 'weak' | 'resist' | 'normal';
      stale: boolean;
    }
  | { kind: 'guard' }
  | { kind: 'tea'; heal: number }
  | { kind: 'enemy'; heavy: boolean; damage: number; guarded: boolean }
  | { kind: 'counter'; damage: number }
  | { kind: 'charge' }
  | { kind: 'end'; won: boolean };

/** What happened, in order, with the hit points left after each step. */
export type BattleEvent = Step & { hero: number; enemy: number };

export const startBattle = (id: BattleId): BattleState => ({
  id,
  hero: HERO_HP,
  enemy: BATTLES[id].hp,
  teas: TEAS,
  last: null,
  turn: 0,
  status: 'fight',
});

/** True when the enemy's next turn is the heavy one. */
export const heavyNext = (state: BattleState) => (state.turn + 1) % HEAVY_EVERY === 0;

export function canAct(state: BattleState, action: Action): boolean {
  if (state.status !== 'fight') return false;
  return action.type !== 'tea' || (state.teas > 0 && state.hero < HERO_HP);
}

/**
 * One full turn: the hero acts, then the enemy answers. `random` returns a
 * number in [0, 1) and only adds a little spread to the damage.
 */
export function takeTurn(
  state: BattleState,
  action: Action,
  random: () => number,
): { state: BattleState; events: BattleEvent[] } {
  if (!canAct(state, action)) return { state, events: [] };

  const foe = BATTLES[state.id];
  const events: BattleEvent[] = [];
  let { hero, enemy, teas, last } = state;
  const push = (step: Step) => events.push({ ...step, hero, enemy });
  const finish = (status: BattleState['status'], turn: number) => ({
    state: { ...state, hero, enemy, teas, last, turn, status },
    events,
  });

  if (action.type === 'move') {
    const effect =
      action.move === foe.weak ? 'weak' : action.move === foe.resists ? 'resist' : 'normal';
    const stale = action.move === last;
    const raw =
      (MOVE_POWER + Math.floor(random() * 3)) *
      (effect === 'weak' ? 2 : effect === 'resist' ? 0.5 : 1) *
      (stale ? 0.5 : 1);
    const damage = Math.min(enemy, Math.max(1, Math.floor(raw)));
    enemy -= damage;
    last = action.move;
    push({ kind: 'move', move: action.move, damage, effect, stale });
  } else if (action.type === 'tea') {
    const heal = Math.min(TEA_HEAL, HERO_HP - hero);
    hero += heal;
    teas -= 1;
    last = null;
    push({ kind: 'tea', heal });
  } else {
    last = null;
    push({ kind: 'guard' });
  }

  if (enemy === 0) {
    push({ kind: 'end', won: true });
    return finish('won', state.turn);
  }

  const heavy = heavyNext(state);
  const guarded = action.type === 'guard';
  const blow = (heavy ? foe.heavy : foe.attack) + Math.floor(random() * 2);
  const damage = Math.min(hero, guarded ? Math.floor(blow / 4) : blow);
  hero -= damage;
  push({ kind: 'enemy', heavy, damage, guarded });
  const turn = state.turn + 1;

  if (hero === 0) {
    push({ kind: 'end', won: false });
    return finish('lost', turn);
  }

  // Guarding the heavy blow opens the enemy up.
  if (guarded && heavy) {
    const counter = Math.min(enemy, COUNTER_DAMAGE);
    enemy -= counter;
    push({ kind: 'counter', damage: counter });
    if (enemy === 0) {
      push({ kind: 'end', won: true });
      return finish('won', turn);
    }
  }

  const next = finish('fight', turn);
  if (heavyNext(next.state)) push({ kind: 'charge' });
  return next;
}
