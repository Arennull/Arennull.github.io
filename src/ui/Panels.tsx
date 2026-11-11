import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { projects } from '../../content/projects';
import { BossFight } from '../games/BossFight';
import { ChunkingLab } from '../games/ChunkingLab';
import { CloserFarther } from '../games/CloserFarther';
import { RetrieverGame } from '../games/RetrieverGame';
import { useI18n } from '../i18n';
import { CLUSTER_COLORS, CONTACT, STACK } from '../i18n/strings';
import { neuronById, neurons } from '../lib/brain';
import { bossUnlocked, TRIALS, WIN_XP, type BattleId, type TrialId } from '../lib/progress';
import { CLUSTERS } from '../lib/types';
import { Battle } from './Battle';
import { useGame } from './progress';
import { ENEMIES } from './sprite-data';
import { Avatar, Sprite } from './sprites';

const BATTLE_IDS: BattleId[] = ['retriever', 'chunking', 'closer', 'boss'];

export function Trials({ onHero }: { onHero: () => void }) {
  const { t } = useI18n();
  const { progress, gain } = useGame();
  const [open, setOpen] = useState<BattleId | null>(null);
  const onScore = useCallback(
    (id: TrialId) => (score: number) => gain({ type: 'trial', id, score }),
    [gain],
  );
  const scores = useMemo(
    () => ({
      retriever: onScore('retriever'),
      chunking: onScore('chunking'),
      closer: onScore('closer'),
    }),
    [onScore],
  );

  if (open) {
    return (
      <Battle id={open} onExit={() => setOpen(null)} onHero={onHero}>
        {(onTurn) => (
          <>
            {open === 'retriever' && <RetrieverGame onScore={scores.retriever} onTurn={onTurn} />}
            {open === 'chunking' && <ChunkingLab onScore={scores.chunking} onTurn={onTurn} />}
            {open === 'closer' && <CloserFarther onScore={scores.closer} onTurn={onTurn} />}
            {open === 'boss' && <BossFight onTurn={onTurn} />}
          </>
        )}
      </Battle>
    );
  }

  const unlocked = bossUnlocked(progress);

  return (
    <section aria-labelledby="trials-title">
      <h2 id="trials-title">{t.tabs.trials}</h2>
      <ul className="trial-list">
        {BATTLE_IDS.map((id) => {
          const locked = id === 'boss' && !unlocked;
          const beaten = progress.wins.includes(id);
          const reward = WIN_XP[id] + (id === 'boss' ? 0 : TRIALS[id].max * TRIALS[id].xp);
          return (
            <li key={id}>
              <button
                type="button"
                className={`trial-card ${id === 'boss' ? 'boss' : ''}`}
                disabled={locked}
                onClick={() => setOpen(id)}
              >
                <Sprite data={ENEMIES[id]} size={44} className={locked ? 'locked' : ''} />
                <span>
                  <b>{locked ? t.map.unknown : t.enemies[id]}</b>
                  <small>{locked ? t.battle.locked : t.trials.blurbs[id]}</small>
                </span>
                <span className="trial-meta">
                  {beaten && <span className="tick">✓ {t.battle.beaten}</span>}
                  {id !== 'boss' && (
                    <span className="pips" aria-hidden>
                      {Array.from({ length: TRIALS[id].max }, (_, n) => (
                        <i key={n} className={n < (progress.trials[id] ?? 0) ? 'on' : ''} />
                      ))}
                    </span>
                  )}
                  <small>
                    {t.trials.reward} {reward} XP
                  </small>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Quests({ onLocate }: { onLocate: (index: number) => void }) {
  const { t, lang } = useI18n();
  const { progress, gain } = useGame();
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpen(open === id ? null : id);
    if (open !== id) gain({ type: 'quest', id });
  };

  return (
    <section aria-labelledby="quests-title">
      <h2 id="quests-title">{t.tabs.quests}</h2>
      <ul className="quests">
        {projects.map((p) => {
          const isOpen = open === p.id;
          return (
            <li key={p.id} className={isOpen ? 'open' : ''}>
              <button
                type="button"
                className="quest-head"
                aria-expanded={isOpen}
                onClick={() => toggle(p.id)}
              >
                <span className={`star ${p.featured ? 'main' : ''}`} aria-hidden>
                  {p.featured ? '★' : '◆'}
                </span>
                <span>
                  <b>{p.name}</b>
                  <small>{p.featured ? t.quests.main : t.quests.side}</small>
                </span>
                {progress.quests.includes(p.id) && <span className="tick">✓ {t.quests.done}</span>}
              </button>
              {isOpen && (
                <div className="quest-body">
                  <p>{p.tagline[lang]}</p>
                  {p.metrics.length > 0 && (
                    <>
                      <h3>{t.quests.loot}</h3>
                      <dl className="loot">
                        {p.metrics.map((m) => (
                          <div key={m.value}>
                            <dt>{m.value}</dt>
                            <dd>{m.label[lang]}</dd>
                          </div>
                        ))}
                      </dl>
                    </>
                  )}
                  <h3>{t.quests.items}</h3>
                  <ul className="items">
                    {p.stack.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <details>
                    <summary>{t.quests.details}</summary>
                    {p.points[lang].length > 0 ? (
                      <ul className="points">
                        {p.points[lang].map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{p.summary[lang]}</p>
                    )}
                  </details>
                  <div className="row">
                    {p.url && (
                      <a className="btn small" href={p.url} target="_blank" rel="noreferrer">
                        {t.quests.visit} ↗
                      </a>
                    )}
                    {p.neuron && (
                      <button
                        type="button"
                        className="btn small"
                        onClick={() => onLocate(neuronById(p.neuron!).index)}
                      >
                        {t.quests.locate}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function HeroSheet() {
  const { t } = useI18n();
  const { progress, gain } = useGame();
  const found = new Set(progress.discovered);

  return (
    <section className="sheet" aria-labelledby="sheet-title">
      <header>
        <Avatar size={84} />
        <div>
          <h2 id="sheet-title">{t.hero.name}</h2>
          <dl className="facts">
            <dt>{t.sheet.class}</dt>
            <dd>{t.hero.role}</dd>
            <dt>{t.sheet.guild}</dt>
            <dd>{t.hero.guild}</dd>
          </dl>
        </div>
      </header>
      <p className="seeking">{t.sheet.quest}</p>

      <h3>{t.sheet.stats}</h3>
      <ul className="stats">
        {CLUSTERS.map((cluster) => {
          const all = neurons.filter((n) => n.node.cluster === cluster);
          const known = all.filter((n) => found.has(n.node.id)).length;
          return (
            <li key={cluster}>
              <span>{t.clusters[cluster]}</span>
              <span className="meter" aria-hidden>
                <span
                  style={{
                    width: `${(known / all.length) * 100}%`,
                    background: CLUSTER_COLORS[cluster],
                  }}
                />
              </span>
              <span className="num">
                {known}/{all.length}
              </span>
            </li>
          );
        })}
      </ul>

      <h3>{t.sheet.inventory}</h3>
      <ul className="items">
        {STACK.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3>{t.sheet.trophies}</h3>
      <ul className="items trophies">
        {BATTLE_IDS.map((id) => {
          const won = progress.wins.includes(id);
          return (
            <li key={id} className={won ? 'won' : ''}>
              {won ? t.loot[id] : t.map.unknown}
            </li>
          );
        })}
      </ul>

      <div className="row">
        <a
          className="btn primary"
          href={`mailto:${CONTACT.email}`}
          onClick={() => gain({ type: 'recruit' })}
        >
          ✉ {t.sheet.recruit}
        </a>
        <a className="btn" href={CONTACT.github} target="_blank" rel="noreferrer">
          {t.sheet.github} ↗
        </a>
      </div>
      <p className="num email">{CONTACT.email}</p>
    </section>
  );
}

/** The plain version for whoever has thirty seconds and no time to play. */
export function CvDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="cv win"
      aria-labelledby="cv-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div>
        <h2 id="cv-title">{t.cv.title}</h2>
        <ul className="points">
          {t.cv.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <h3>{t.cv.projects}</h3>
        <ul className="cv-projects">
          {projects.map((p) => (
            <li key={p.id}>
              <b>{p.name}</b> — {p.tagline[lang]}
            </li>
          ))}
        </ul>
        <h3>{t.cv.stack}</h3>
        <p>{STACK.join(' · ')}</p>
        <div className="row">
          <a className="btn primary" href={`mailto:${CONTACT.email}`}>
            ✉ {CONTACT.email}
          </a>
          <a className="btn" href={CONTACT.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <button type="button" className="btn" onClick={onClose}>
            {t.cv.close}
          </button>
        </div>
      </div>
    </dialog>
  );
}
