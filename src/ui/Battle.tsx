import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import type { Strings } from '../i18n/strings';
import {
  BATTLES,
  HERO_HP,
  MOVE_IDS,
  canAct,
  heavyNext,
  startBattle,
  takeTurn,
  type Action,
  type BattleEvent,
  type BattleState,
} from '../lib/battle';
import { embeddedQueries, neurons } from '../lib/brain';
import { TOWER_COUNT, knowsWeakness } from '../lib/intel';
import type { BattleId } from '../lib/progress';
import { projects } from '../../content/projects';
import { CONTACT } from '../i18n/strings';
import { useGame } from './progress';
import { play, startMusic, stopMusic } from './sfx';
import { ENEMIES, HERO, HERO_ATTACK } from './sprite-data';
import { Avatar, Sprite } from './sprites';

// A save can outlive the towers, questions or quests it names: count only what still exists.
const TOWER_IDS = new Set(neurons.map((n) => n.node.id));
const QUESTION_IDS = new Set(embeddedQueries.map((q) => q.query.id));
const QUEST_IDS = new Set(projects.map((p) => p.id));
const count = (ids: string[], known: Set<string>) => ids.filter((id) => known.has(id)).length;

const HERO_SIZE = 64;
/** How long each step of a turn stays on screen. */
const BEAT_MS = 1150;

interface Fight {
  state: BattleState;
  /** The steps of the turn being shown, and which one is on screen. */
  beats: BattleEvent[];
  index: number;
}

const startFight = (id: BattleId): Fight => ({ state: startBattle(id), beats: [], index: 0 });

function Hp({ value, max, label }: { value: number; max: number; label: string }) {
  const ratio = value / max;
  return (
    <span className="hpbar" role="img" aria-label={`${label} ${value}/${max}`}>
      <i
        className={ratio > 0.5 ? '' : ratio > 0.2 ? 'mid' : 'low'}
        style={{ width: `${ratio * 100}%` }}
      />
    </span>
  );
}

/** One line for the message box. */
function describe(event: BattleEvent, id: BattleId, t: Strings): string {
  const b = t.battle;
  const name = t.enemies[id];
  switch (event.kind) {
    case 'move': {
      const used = b.uses(b.moves[event.move]);
      if (event.effect === 'weak') return `${used} ${b.weak} ${b.why[event.move]}`;
      if (event.effect === 'resist') return `${used} ${b.resist} ${b.resistWhy[id]}`;
      return event.stale ? `${used} ${b.stale}` : used;
    }
    case 'guard':
      return b.guards;
    case 'tea':
      return b.tea(event.heal);
    case 'enemy': {
      const attack = b.enemyUses(name, b.enemyMoves[id][event.heavy ? 'heavy' : 'normal']);
      return event.guarded ? `${attack} ${b.blocked}` : attack;
    }
    case 'counter':
      return b.counter;
    case 'charge':
      return b.charge(name);
    case 'end':
      return event.won ? b.falls(name) : b.lost;
  }
}

interface Props {
  id: BattleId;
  onExit: () => void;
  onHero: () => void;
}

/** A turn-based fight in the dojo: pick a technique, guard, drink tea or leave. */
export function Battle({ id, onExit, onHero }: Props) {
  const { t } = useI18n();
  const { gain, progress } = useGame();
  // What the hero learnt in the city before the fight; it does not change during it.
  const scouted = knowsWeakness(progress, id);
  const [{ state, beats, index }, setFight] = useState(() => startFight(id));
  const [picking, setPicking] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const mounted = useRef(false);
  const menu = useRef<HTMLDivElement>(null);
  const outcome = useRef<HTMLDivElement>(null);
  const name = t.enemies[id];

  const beat = beats[index];
  const playing = beat !== undefined;
  const over = !playing && state.status !== 'fight';
  const hp = beat ?? state;
  const opening = state.turn === 0 && state.last === null && beats.length === 0;

  // Show the turn one step at a time.
  useEffect(() => {
    if (!beat) return;
    if (beat.kind === 'move' || beat.kind === 'counter') play('hit');
    else if (beat.kind === 'enemy' && beat.damage > 0) play('hurt');
    else if (beat.kind === 'tea') play('xp');
    const timer = setTimeout(() => setFight((f) => ({ ...f, index: f.index + 1 })), BEAT_MS);
    return () => clearTimeout(timer);
  }, [beat]);

  // The dojo music lasts as long as the fight; the boss gets a faster one.
  useEffect(() => {
    if (over) return;
    startMusic(id === 'boss');
    return stopMusic;
  }, [id, over]);

  // Hand the keyboard back once the turn has played out.
  useEffect(() => {
    if (playing || opening) return;
    if (state.status === 'fight') {
      menu.current?.querySelector('button')?.focus();
      return;
    }
    if (state.status === 'won') gain({ type: 'win', id });
    play(state.status === 'won' ? 'win' : 'lose');
    outcome.current?.querySelector<HTMLElement>('a, button')?.focus();
  }, [playing, opening, state.status, id, gain]);

  // Opening or closing the list of techniques, or starting over, swaps the buttons:
  // keep the keyboard on the menu instead of losing it.
  useEffect(() => {
    if (mounted.current) menu.current?.querySelector('button')?.focus();
    mounted.current = true;
  }, [picking, attempt]);

  const act = (action: Action) => {
    setPicking(false);
    setFight((fight) => {
      if (fight.index < fight.beats.length) return fight;
      const turn = takeTurn(fight.state, action, Math.random);
      return turn.events.length > 0 ? { state: turn.state, beats: turn.events, index: 0 } : fight;
    });
  };

  const retry = () => {
    setPicking(false);
    setFight(startFight(id));
    setAttempt((n) => n + 1);
  };

  const heroStrikes = beat?.kind === 'move' || beat?.kind === 'counter';
  const heroClass = [
    heroStrikes ? 'attack' : '',
    beat?.kind === 'enemy' && beat.damage > 0 ? 'hurt' : '',
    beat?.kind === 'tea' ? 'heal' : '',
    beat?.kind === 'guard' || (beat?.kind === 'enemy' && beat.guarded) ? 'guard' : '',
  ].join(' ');
  // The enemy glows while it gathers strength, so the heavy blow is never a surprise.
  const charging = !playing && state.status === 'fight' && heavyNext(state);
  const foeClass = heroStrikes
    ? 'hurt'
    : beat?.kind === 'enemy'
      ? 'foe-attack'
      : beat?.kind === 'charge' || charging
        ? 'charge'
        : '';

  let message = t.battle.prompt;
  if (beat) message = describe(beat, id, t);
  else if (over) message = state.status === 'won' ? t.battle.falls(name) : t.battle.lost;
  else if (opening) message = t.battle.appears(name);
  else if (charging) message = t.battle.charge(name);

  return (
    <section className="battle">
      <button type="button" className="btn small" onClick={onExit}>
        ◀ {t.battle.back}
      </button>

      <div className={`dojo ${over ? state.status : ''}`}>
        <div className="plate foe-plate">
          <b>{name}</b>
          <Hp value={hp.enemy} max={BATTLES[id].hp} label={t.battle.hp} />
        </div>
        <div className="foe">
          <span key={index} className={foeClass}>
            <Sprite data={ENEMIES[id]} size={id === 'boss' ? 104 : 80} />
          </span>
        </div>
        <div className="samurai">
          <span key={index} className={heroClass}>
            <Avatar size={HERO_SIZE} />
            {heroStrikes && (
              <Sprite
                data={HERO_ATTACK}
                size={(HERO_SIZE * HERO_ATTACK.rows[0]!.length) / HERO.rows[0]!.length}
                className="strike"
              />
            )}
          </span>
        </div>
        <div className="plate hero-plate">
          <b>{t.tabs.hero}</b>
          <Hp value={hp.hero} max={HERO_HP} label={t.battle.hp} />
          <small className="num">
            {hp.hero}/{HERO_HP}
          </small>
        </div>
      </div>

      <p className="battle-log" aria-live="polite">
        {message}
      </p>

      {!over && (
        <div ref={menu} className="battle-menu" role="group" aria-label={t.battle.prompt}>
          {picking ? (
            <>
              {MOVE_IDS.map((move) => (
                <button
                  type="button"
                  key={move}
                  className="btn"
                  disabled={playing}
                  aria-label={
                    scouted && move === BATTLES[id].weak
                      ? `${t.battle.moves[move]} (${t.battle.weakTo(t.battle.moves[move])})`
                      : undefined
                  }
                  onClick={() => act({ type: 'move', move })}
                >
                  {scouted && move === BATTLES[id].weak && <span aria-hidden>★ </span>}
                  {t.battle.moves[move]}
                </button>
              ))}
              <button type="button" className="btn small wide" onClick={() => setPicking(false)}>
                ◀ {t.battle.cancel}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn primary"
                disabled={playing}
                onClick={() => setPicking(true)}
              >
                {t.battle.fight}
              </button>
              <button
                type="button"
                className="btn"
                disabled={playing}
                onClick={() => act({ type: 'guard' })}
              >
                {t.battle.guard}
              </button>
              <button
                type="button"
                className="btn"
                disabled={playing || !canAct(state, { type: 'tea' })}
                onClick={() => act({ type: 'tea' })}
              >
                {t.battle.teaItem} ×{state.teas}
              </button>
              <button type="button" className="btn" disabled={playing} onClick={onExit}>
                {t.battle.run}
              </button>
            </>
          )}
        </div>
      )}

      <div ref={outcome} role="status">
        {over && state.status === 'won' && (
          <div className="outcome won">
            <strong>{t.battle.won}</strong>
            <span>
              {t.battle.loot}: <b>{t.loot[id]}</b>
            </span>
            {id === 'boss' && (
              <>
                <p>
                  <b>{t.ending.title}</b> {t.boss.ending}
                </p>
                <p className="num">
                  {t.ending.stats(
                    count(progress.discovered, TOWER_IDS),
                    TOWER_COUNT,
                    count(progress.asked, QUESTION_IDS),
                    embeddedQueries.length,
                    count(progress.quests, QUEST_IDS),
                    projects.length,
                  )}
                </p>
              </>
            )}
            <div className="row">
              {id === 'boss' && (
                <>
                  <a
                    className="btn primary"
                    href={`mailto:${CONTACT.email}`}
                    onClick={() => gain({ type: 'recruit' })}
                  >
                    ✉ {t.sheet.recruit}
                  </a>
                  <button type="button" className="btn" onClick={onHero}>
                    {t.tabs.hero} ▸
                  </button>
                </>
              )}
              <button type="button" className="btn" onClick={onExit}>
                {t.battle.back}
              </button>
            </div>
          </div>
        )}
        {over && state.status === 'lost' && (
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
    </section>
  );
}
