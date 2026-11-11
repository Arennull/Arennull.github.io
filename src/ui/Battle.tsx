import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../i18n';
import { BATTLES, startBattle, strike, type BattleState } from '../lib/battle';
import type { BattleId } from '../lib/progress';
import { useGame } from './progress';
import { play } from './sfx';
import { ENEMIES, HERO, HERO_ATTACK } from './sprite-data';
import { Avatar, Sprite } from './sprites';

/** What a game reports after each move: right answers and wrong ones. */
export type Turn = (hits: number, misses: number) => void;

interface Fight {
  state: BattleState;
  /** The last move that counted, numbered so its animation can replay. */
  last: { hits: number; misses: number; n: number } | null;
}

const HERO_SIZE = 52;

const startFight = (id: BattleId): Fight => ({ state: startBattle(id), last: null });

function Hp({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <span className="hp" role="img" aria-label={`${label} ${value}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className={i < value ? 'on' : ''} />
      ))}
    </span>
  );
}

interface Props {
  id: BattleId;
  onExit: () => void;
  onHero: () => void;
  children: (onTurn: Turn) => ReactNode;
}

/** Wraps a game as a turn-based fight: the game is the hero's move. */
export function Battle({ id, onExit, onHero, children }: Props) {
  const { t } = useI18n();
  const { gain } = useGame();
  const [attempt, setAttempt] = useState(0);
  const [{ state, last }, setFight] = useState(() => startFight(id));
  const outcome = useRef<HTMLDivElement>(null);
  const name = t.enemies[id];

  const onTurn = useCallback<Turn>((hits, misses) => {
    if (hits === 0 && misses === 0) return;
    // Once the fight is decided, nothing a game reports counts any more.
    setFight((fight) =>
      fight.state.status !== 'fight'
        ? fight
        : {
            state: strike(fight.state, hits, misses),
            last: { hits, misses, n: (fight.last?.n ?? 0) + 1 },
          },
    );
  }, []);

  useEffect(() => {
    if (last) play(last.hits > 0 ? 'hit' : 'hurt');
  }, [last]);

  useEffect(() => {
    if (state.status === 'fight') return;
    if (state.status === 'won') gain({ type: 'win', id });
    play(state.status === 'won' ? 'win' : 'lose');
    // The game's own buttons have just been disabled; keep keyboard users in the fight.
    outcome.current?.querySelector('button')?.focus();
  }, [state.status, id, gain]);

  const retry = () => {
    setAttempt((a) => a + 1);
    setFight(startFight(id));
  };

  const heroHurt = last !== null && last.misses > 0 && state.status !== 'won';
  const heroStrikes = last !== null && last.hits > 0;
  let log = t.battle.appears(name);
  if (last) {
    log = [
      last.hits > 0 ? t.battle.hit(last.hits) : '',
      heroHurt ? t.battle.hurt(name, last.misses) : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  return (
    <section className="battle">
      <button type="button" className="btn small" onClick={onExit}>
        ◀ {t.battle.back}
      </button>

      <div className={`arena ${state.status}`}>
        <div className="fighter hero">
          <span
            key={last?.n}
            className={`${heroStrikes ? 'attack' : ''} ${heroHurt ? 'hurt' : ''}`}
          >
            <Avatar size={HERO_SIZE} />
            {heroStrikes && (
              <Sprite
                data={HERO_ATTACK}
                size={(HERO_SIZE * HERO_ATTACK.rows[0]!.length) / HERO.rows[0]!.length}
                className="strike"
              />
            )}
          </span>
          <b>{t.tabs.hero}</b>
          <Hp value={state.hero} max={BATTLES[id].hero} label={t.battle.hp} />
        </div>
        <span className="vs" aria-hidden>
          VS
        </span>
        <div className="fighter enemy">
          <span key={last?.n} className={last && last.hits > 0 ? 'hurt' : ''}>
            <Sprite data={ENEMIES[id]} size={id === 'boss' ? 84 : 60} />
          </span>
          <b>{name}</b>
          <Hp value={state.enemy} max={BATTLES[id].enemy} label={t.battle.hp} />
        </div>
      </div>

      <p className="battle-log" aria-live="polite">
        {log}
      </p>

      <div ref={outcome} role="status">
        {state.status === 'won' && (
          <div className="outcome won">
            <strong>{t.battle.won}</strong>
            <span>
              {t.battle.loot}: <b>{t.loot[id]}</b>
            </span>
            {id === 'boss' && <p>{t.boss.ending}</p>}
            <div className="row">
              {id === 'boss' && (
                <button type="button" className="btn primary" onClick={onHero}>
                  {t.tabs.hero} ▸
                </button>
              )}
              <button type="button" className="btn" onClick={onExit}>
                {t.battle.back}
              </button>
            </div>
          </div>
        )}
        {state.status === 'lost' && (
          <div className="outcome lost">
            <strong>{t.battle.lost}</strong>
            <div className="row">
              <button type="button" className="btn primary" onClick={retry}>
                {t.battle.retry}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* A disabled fieldset freezes the game once the fight is over, with the last move on show. */}
      <fieldset key={attempt} className="battle-field" disabled={state.status !== 'fight'}>
        {children(onTurn)}
      </fieldset>
    </section>
  );
}
