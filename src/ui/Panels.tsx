import { useEffect, useRef, useState } from 'react';
import { projects } from '../../content/projects';
import { ChunkingLab } from '../games/ChunkingLab';
import { CloserFarther } from '../games/CloserFarther';
import { RetrieverGame } from '../games/RetrieverGame';
import { useI18n } from '../i18n';
import { CLUSTER_COLORS, CONTACT, STACK } from '../i18n/strings';
import { neuronById, neurons } from '../lib/brain';
import { TRIALS, type TrialId } from '../lib/progress';
import { CLUSTERS } from '../lib/types';
import { useGame } from './progress';

const AVATAR = [
  '....hhhh....',
  '...hhhhhh...',
  '..hhhhhhhh..',
  '..hssssssh..',
  '..hsesseSh..',
  '..hssssssh..',
  '...hssssh...',
  '..rrrrrrrr..',
  '.rrrryyrrrr.',
  '.rrrryyrrrr.',
  '.srrrrrrrrs.',
  '..rrrrrrrr..',
  '..rrr..rrr..',
  '..bbb..bbb..',
];
const AVATAR_COLORS: Record<string, string> = {
  h: '#3b5dc9',
  s: '#ffcd75',
  S: '#ffcd75',
  e: '#1a1c2c',
  r: '#29366f',
  y: '#ffcd75',
  b: '#333c57',
};

/** A small original pixel sprite: a hooded scholar. */
export function Avatar({ size = 48 }: { size?: number }) {
  return (
    <svg
      className="avatar"
      viewBox="0 0 12 14"
      width={size}
      height={(size * 14) / 12}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {AVATAR.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === '.' ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={AVATAR_COLORS[cell]} />
          ),
        ),
      )}
    </svg>
  );
}

const TRIAL_IDS: TrialId[] = ['retriever', 'chunking', 'closer'];

export function Trials() {
  const { t } = useI18n();
  const { progress, gain } = useGame();
  const [open, setOpen] = useState<TrialId | null>(null);
  const score = (id: TrialId) => (value: number) => gain({ type: 'trial', id, score: value });

  if (open) {
    return (
      <section className="trial">
        <button type="button" className="btn small" onClick={() => setOpen(null)}>
          ◀ {t.trials.back}
        </button>
        <h2>{t.trials.names[open]}</h2>
        {open === 'retriever' && <RetrieverGame onScore={score('retriever')} />}
        {open === 'chunking' && <ChunkingLab onScore={score('chunking')} />}
        {open === 'closer' && <CloserFarther onScore={score('closer')} />}
      </section>
    );
  }

  return (
    <section aria-labelledby="trials-title">
      <h2 id="trials-title">{t.tabs.trials}</h2>
      <ul className="trial-list">
        {TRIAL_IDS.map((id, i) => {
          const best = progress.trials[id] ?? 0;
          return (
            <li key={id}>
              <button type="button" className="trial-card" onClick={() => setOpen(id)}>
                <span className="trial-number">{i + 1}</span>
                <span>
                  <b>{t.trials.names[id]}</b>
                  <small>{t.trials.blurbs[id]}</small>
                </span>
                <span className="trial-meta">
                  <span className="pips" aria-hidden>
                    {Array.from({ length: TRIALS[id].max }, (_, n) => (
                      <i key={n} className={n < best ? 'on' : ''} />
                    ))}
                  </span>
                  <small>
                    {t.trials.reward} {TRIALS[id].max * TRIALS[id].xp} XP
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
