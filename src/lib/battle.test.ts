import { describe, expect, it } from 'vitest';
import {
  BATTLES,
  HERO_HP,
  MOVE_IDS,
  TEAS,
  TEA_HEAL,
  canAct,
  heavyNext,
  startBattle,
  takeTurn,
  type Action,
  type BattleState,
} from './battle';
import type { BattleId } from './progress';
import { seeded } from './random';

const IDS = Object.keys(BATTLES) as BattleId[];
const low = () => 0;
const move = (id: (typeof MOVE_IDS)[number]): Action => ({ type: 'move', move: id });

/** Plays until the battle ends, asking `choose` for every action. */
function play(id: BattleId, seed: number, choose: (state: BattleState) => Action) {
  const random = seeded(seed);
  let state = startBattle(id);
  for (let i = 0; i < 100 && state.status === 'fight'; i++) {
    state = takeTurn(state, choose(state), random).state;
  }
  return state;
}

/** Guard the heavy blow, drink tea when low, otherwise alternate the best move with another. */
function sensible(state: BattleState): Action {
  if (heavyNext(state)) return { type: 'guard' };
  if (state.hero <= 10 && state.teas > 0) return { type: 'tea' };
  const { weak, resists } = BATTLES[state.id];
  const other = MOVE_IDS.find((m) => m !== weak && m !== resists)!;
  return move(state.last === weak ? other : weak);
}

describe('takeTurn', () => {
  it('hits twice as hard with the technique the enemy is weak to', () => {
    const start = startBattle('retriever');
    const weak = takeTurn(start, move('vector'), low).events[0]!;
    const normal = takeTurn(start, move('cite'), low).events[0]!;
    const resisted = takeTurn(start, move('keyword'), low).events[0]!;
    expect(weak).toMatchObject({ kind: 'move', effect: 'weak', damage: 10 });
    expect(normal).toMatchObject({ kind: 'move', effect: 'normal', damage: 5 });
    expect(resisted).toMatchObject({ kind: 'move', effect: 'resist', damage: 2 });
  });

  it('weakens a technique used twice in a row, and forgives it after anything else', () => {
    const first = takeTurn(startBattle('boss'), move('cite'), low).state;
    const again = takeTurn(first, move('cite'), low);
    expect(again.events[0]).toMatchObject({ stale: true, damage: 5 });
    const rested = takeTurn(takeTurn(first, { type: 'guard' }, low).state, move('cite'), low);
    expect(rested.events[0]).toMatchObject({ stale: false, damage: 10 });
  });

  it('announces the heavy blow one turn ahead, and guarding it counters', () => {
    let state = startBattle('closer');
    state = takeTurn(state, move('cite'), low).state;
    const second = takeTurn(state, move('overlap'), low);
    expect(second.events.at(-1)).toMatchObject({ kind: 'charge' });
    expect(heavyNext(second.state)).toBe(true);

    const guarded = takeTurn(second.state, { type: 'guard' }, low);
    expect(guarded.events.map((e) => e.kind)).toEqual(['guard', 'enemy', 'counter']);
    expect(guarded.events[1]).toMatchObject({ heavy: true, guarded: true, damage: 2 });
    expect(guarded.state.enemy).toBe(second.state.enemy - 8);
  });

  it('heals with tea, never above the maximum, and only while some is left', () => {
    const hurt = { ...startBattle('chunking'), hero: 25 };
    const sip = takeTurn(hurt, { type: 'tea' }, low);
    expect(sip.events[0]).toMatchObject({ kind: 'tea', heal: 5, hero: HERO_HP });
    expect(sip.state.teas).toBe(TEAS - 1);
    expect(TEA_HEAL).toBeGreaterThan(5);
    expect(canAct(startBattle('chunking'), { type: 'tea' })).toBe(false);
    expect(canAct({ ...hurt, teas: 0 }, { type: 'tea' })).toBe(false);
  });

  it('ends at once on the finishing blow: the enemy does not answer', () => {
    const { state, events } = takeTurn(
      { ...startBattle('retriever'), enemy: 3 },
      move('cite'),
      low,
    );
    expect(state.status).toBe('won');
    expect(events.map((e) => e.kind)).toEqual(['move', 'end']);
  });

  it('loses when the hero runs out of hit points', () => {
    const { state, events } = takeTurn({ ...startBattle('boss'), hero: 2 }, move('cite'), low);
    expect(state.status).toBe('lost');
    expect(events.at(-1)).toMatchObject({ kind: 'end', won: false, hero: 0 });
  });

  it('ignores turns after the battle is over', () => {
    const over = { ...startBattle('closer'), status: 'won' as const };
    expect(takeTurn(over, move('vector'), low)).toEqual({ state: over, events: [] });
  });

  it('never leaves hit points out of range', () => {
    for (const id of IDS) {
      const random = seeded(11);
      let state = startBattle(id);
      for (let i = 0; i < 60 && state.status === 'fight'; i++) {
        const { state: next, events } = takeTurn(state, move(MOVE_IDS[i % 4]!), random);
        for (const e of events) {
          expect(e.hero).toBeGreaterThanOrEqual(0);
          expect(e.hero).toBeLessThanOrEqual(HERO_HP);
          expect(e.enemy).toBeGreaterThanOrEqual(0);
        }
        state = next;
      }
    }
  });
});

describe('balance', () => {
  it.each(IDS)('%s can be beaten by playing well, whatever the luck', (id) => {
    for (let seed = 1; seed <= 200; seed++) expect(play(id, seed, sensible).status).toBe('won');
  });

  it('the boss punishes repeating one technique without ever guarding', () => {
    const { resists } = BATTLES.boss;
    for (let seed = 1; seed <= 50; seed++) {
      expect(play('boss', seed, () => move(resists)).status).toBe('lost');
    }
  });

  it('the guardians forgive a beginner who only attacks with any one technique', () => {
    for (const id of ['retriever', 'chunking', 'closer'] as const) {
      const { weak } = BATTLES[id];
      for (let seed = 1; seed <= 50; seed++) {
        expect(play(id, seed, () => move(weak)).status).toBe('won');
      }
    }
  });
});
