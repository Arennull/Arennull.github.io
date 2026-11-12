import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { partOf, profile, projectFacts } from '../../content/project-facts';
import { projects } from '../../content/projects';
import { LANGUAGE_REPOS, languages } from '../../content/skills';
import { ChunkingLab } from '../games/ChunkingLab';
import { CloserFarther } from '../games/CloserFarther';
import { RetrieverGame } from '../games/RetrieverGame';
import { useI18n } from '../i18n';
import { CLUSTER_COLORS, CONTACT, PALETTE, STACK } from '../i18n/strings';
import { neuronById, neurons } from '../lib/brain';
import { bossUnlocked, TRIALS, WIN_XP, type BattleId, type TrialId } from '../lib/progress';
import { CLUSTERS, type Lang } from '../lib/types';
import { Battle } from './Battle';
import { useGame } from './progress';
import { ENEMIES, LANDMARKS } from './sprite-data';
import { Avatar, Sprite } from './sprites';

const BATTLE_IDS: BattleId[] = ['retriever', 'chunking', 'closer', 'boss'];

const TRIAL_IDS: TrialId[] = ['retriever', 'chunking', 'closer'];

export function Trials({ onHero }: { onHero: () => void }) {
  const { t } = useI18n();
  const { progress, gain } = useGame();
  const [battle, setBattle] = useState<BattleId | null>(null);
  const [training, setTraining] = useState<TrialId | null>(null);
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

  if (battle) return <Battle id={battle} onExit={() => setBattle(null)} onHero={onHero} />;

  if (training) {
    return (
      <section>
        <button type="button" className="btn small" onClick={() => setTraining(null)}>
          ◀ {t.battle.back}
        </button>
        <h2>{t.trials.names[training]}</h2>
        {training === 'retriever' && <RetrieverGame onScore={scores.retriever} />}
        {training === 'chunking' && <ChunkingLab onScore={scores.chunking} />}
        {training === 'closer' && <CloserFarther onScore={scores.closer} />}
      </section>
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
          return (
            <li key={id}>
              <button
                type="button"
                className={`trial-card ${id === 'boss' ? 'boss' : ''}`}
                disabled={locked}
                onClick={() => setBattle(id)}
              >
                <Sprite data={ENEMIES[id]} size={44} className={locked ? 'locked' : ''} />
                <span>
                  <b>{locked ? t.map.unknown : t.enemies[id]}</b>
                  <small>{locked ? t.battle.locked : t.trials.blurbs[id]}</small>
                </span>
                <span className="trial-meta">
                  {beaten && <span className="tick">✓ {t.battle.beaten}</span>}
                  <small>
                    {t.trials.reward} {WIN_XP[id]} XP
                  </small>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <h3>{t.trials.training}</h3>
      <small>{t.trials.trainingNote}</small>
      <ul className="trial-list training">
        {TRIAL_IDS.map((id) => (
          <li key={id}>
            <button type="button" className="trial-card" onClick={() => setTraining(id)}>
              <span>
                <b>{t.trials.names[id]}</b>
              </span>
              <span className="trial-meta">
                <span className="pips" aria-hidden>
                  {Array.from({ length: TRIALS[id].max }, (_, n) => (
                    <i key={n} className={n < (progress.trials[id] ?? 0) ? 'on' : ''} />
                  ))}
                </span>
                <small>
                  {t.trials.reward} {TRIALS[id].max * TRIALS[id].xp} XP
                </small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 2026-05 → 05/2026, or 2026年5月 in Japanese. */
function month(date: string, lang: Lang): string {
  const [year, mm] = date.split('-');
  return lang === 'ja' ? `${year}年${Number(mm)}月` : `${mm}/${year}`;
}

/** My part in a project, as its version history tells it. */
function Role({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const facts = projectFacts[id];
  if (!facts) return null;
  const [from, to] = facts.period;
  return (
    <span className="role">
      <b>{t.quests.parts[partOf(facts.commits)]}</b> ·{' '}
      {t.quests.commits(facts.commits.mine, facts.commits.total)} ·{' '}
      {from === to ? month(from, lang) : `${month(from, lang)} – ${month(to, lang)}`}
    </span>
  );
}

export function Quests({ onLocate }: { onLocate: (index: number) => void }) {
  const { t, lang } = useI18n();
  const { progress, gain } = useGame();
  const [open, setOpen] = useState<string | null>(null);
  /** Where the hero stands on the quest map: the last quest visited. */
  const [last, setLast] = useState(projects[0]!.id);
  const back = useRef<HTMLButtonElement>(null);
  const map = useRef<HTMLUListElement>(null);
  const wasOpen = useRef(false);
  const project = projects.find((p) => p.id === open);

  // Keep keyboard users in place: into the card, and back to the landmark they came from.
  useEffect(() => {
    if (open) back.current?.focus();
    else if (wasOpen.current) {
      map.current?.querySelector<HTMLButtonElement>(`[data-quest="${last}"]`)?.focus();
    }
    wasOpen.current = open !== null;
  }, [open, last]);

  const enter = (id: string) => {
    setOpen(id);
    setLast(id);
    gain({ type: 'quest', id });
  };

  if (project) {
    const p = project;
    return (
      <section className="quest-card" aria-labelledby="quest-title">
        <button ref={back} type="button" className="btn small" onClick={() => setOpen(null)}>
          ◀ {t.quests.back}
        </button>
        <header className={p.featured ? 'main' : ''}>
          <span className="landmark-frame">
            <Sprite data={LANDMARKS[p.id]!} size={72} />
          </span>
          <div>
            <h2 id="quest-title">{p.name}</h2>
            <small>
              <span className={`star ${p.featured ? 'main' : ''}`} aria-hidden>
                {p.featured ? '★' : '◆'}
              </span>{' '}
              {p.featured ? t.quests.main : t.quests.side}
              {p.codename && ` · ${t.quests.codename}`}
            </small>
            <p>{p.tagline[lang]}</p>
            <Role id={p.id} />
          </div>
        </header>
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
        {projectFacts[p.id]?.decisions && (
          <>
            <h3>{t.quests.decisions}</h3>
            <ul className="points">
              {projectFacts[p.id]!.decisions![lang].map((decision) => (
                <li key={decision}>{decision}</li>
              ))}
            </ul>
          </>
        )}
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
      </section>
    );
  }

  const done = projects.filter((p) => progress.quests.includes(p.id)).length;

  return (
    <section aria-labelledby="quests-title">
      <h2 id="quests-title">
        {t.tabs.quests}{' '}
        <small className="num">
          {done}/{projects.length}
        </small>
      </h2>
      <ul className="quest-map" ref={map}>
        {projects.map((p) => {
          const cleared = progress.quests.includes(p.id);
          return (
            <li key={p.id}>
              <button
                type="button"
                data-quest={p.id}
                className={`landmark ${p.featured ? 'main' : ''} ${cleared ? 'cleared' : ''}`}
                onClick={() => enter(p.id)}
              >
                <span className="landmark-art">
                  <Sprite data={LANDMARKS[p.id]!} size={p.featured ? 60 : 48} />
                  {last === p.id && <Avatar size={24} />}
                </span>
                <b>{p.name}</b>
                <small>
                  <span className={`star ${p.featured ? 'main' : ''}`} aria-hidden>
                    {p.featured ? '★' : '◆'}
                  </span>{' '}
                  {cleared ? `✓ ${t.quests.done}` : p.featured ? t.quests.main : t.quests.side}
                </small>
              </button>
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

      <h3>{t.sheet.languages}</h3>
      <ul className="stats">
        {languages.map((l) => (
          <li key={l.name}>
            <span>{l.name}</span>
            <span className="meter" aria-hidden>
              <span
                style={{
                  width: `${(l.repos / LANGUAGE_REPOS) * 100}%`,
                  background: PALETTE.yellow,
                }}
              />
            </span>
            <span className="num">
              {l.repos}/{LANGUAGE_REPOS}
            </span>
          </li>
        ))}
      </ul>
      <small>{t.sheet.languagesNote(LANGUAGE_REPOS)}</small>

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

/** What the CV says, shared by the dialog on screen and the copy that goes to paper. */
function CvBody({ titleId }: { titleId?: string }) {
  const { t, lang } = useI18n();
  return (
    <>
      <h2 id={titleId}>{t.cv.title}</h2>
      <p>{t.sheet.quest}</p>
      <p>{t.cv.location}</p>
      <ul className="points">
        {t.cv.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <h3>{t.cv.experience}</h3>
      <p>{t.cv.since(month(profile.since, lang))}</p>
      <h3>{t.cv.projects}</h3>
      <ul className="cv-projects">
        {projects.map((p) => (
          <li key={p.id}>
            <b>
              {p.url ? (
                <a href={p.url} target="_blank" rel="noreferrer">
                  {p.name}
                </a>
              ) : (
                p.name
              )}
            </b>{' '}
            — {p.tagline[lang]}
            <Role id={p.id} />
            {p.metrics.length > 0 && (
              <span className="role">
                {p.metrics.map((m) => `${m.value} ${m.label[lang]}`).join(' · ')}
              </span>
            )}
          </li>
        ))}
      </ul>
      <h3>{t.cv.spoken}</h3>
      <p>{t.cv.spokenList}</p>
      <h3>{t.cv.code}</h3>
      <p>{languages.map((l) => l.name).join(' · ')}</p>
      <h3>{t.cv.stack}</h3>
      <p>{STACK.join(' · ')}</p>
    </>
  );
}

/** The plain version for whoever has thirty seconds and no time to play. */
export function CvDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
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
          <CvBody titleId="cv-title" />
          <div className="row">
            <a className="btn primary" href={`mailto:${CONTACT.email}`}>
              ✉ {CONTACT.email}
            </a>
            <a className="btn" href={CONTACT.github} target="_blank" rel="noreferrer">
              {t.sheet.github} ↗
            </a>
            <button type="button" className="btn" onClick={() => window.print()}>
              {t.cv.print}
            </button>
            <button type="button" className="btn" onClick={onClose}>
              {t.cv.close}
            </button>
          </div>
        </div>
      </dialog>
      {/* A modal dialog prints badly, so paper gets its own copy, outside the game. */}
      {open &&
        createPortal(
          <div className="cv-print" aria-hidden>
            <CvBody />
            <p>
              {CONTACT.email} · {CONTACT.github}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}
