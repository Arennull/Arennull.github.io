import type { ReactNode } from 'react';
import { useReducedMotion, useTyped } from '../hooks';
import { useI18n } from '../i18n';
import { CLUSTER_COLORS, CONTACT, type Tab } from '../i18n/strings';
import { EXPLORE_GOAL, levelOf, objectivesOf } from '../lib/progress';
import { CLUSTERS, type Cluster } from '../lib/types';
import { Avatar } from './Panels';
import { useGame } from './progress';

export function Hud({ onSkip }: { onSkip: () => void }) {
  const { t, lang, setLang } = useI18n();
  const { xp } = useGame();
  const { level, fraction, next } = levelOf(xp);

  return (
    <header className="hud">
      <div className="hud-hero">
        <Avatar size={30} />
        <div>
          <b>{t.hero.name}</b>
          <small>{t.hero.role}</small>
        </div>
      </div>

      <div className="hud-level" aria-live="polite">
        <span className="lv">
          {t.level} {level}
        </span>
        <span className="rank">{t.ranks[level - 1]}</span>
        <span
          className="xp"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(fraction * 100)}
          aria-label="XP"
        >
          <span style={{ width: `${fraction * 100}%` }} />
        </span>
        <span className="num">{next === null ? `${xp} XP` : `${xp}/${next}`}</span>
      </div>

      <div className="hud-actions">
        <button type="button" className="btn small" onClick={onSkip}>
          {t.skip} ▸
        </button>
        <div className="lang" role="group" aria-label="Language">
          {(['en', 'es'] as const).map((code) => (
            <button
              type="button"
              key={code}
              className={code === lang ? 'active' : ''}
              aria-pressed={code === lang}
              onClick={() => setLang(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

const TABS: Tab[] = ['map', 'oracle', 'trials', 'quests', 'hero'];

export function Menu({ tab, onTab }: { tab: Tab; onTab: (tab: Tab) => void }) {
  const { t } = useI18n();
  return (
    <nav className="menu" aria-label="Menu">
      {TABS.map((id) => (
        <button
          type="button"
          key={id}
          className={id === tab ? 'active' : ''}
          aria-current={id === tab ? 'page' : undefined}
          onClick={() => onTab(id)}
        >
          <span className="cursor" aria-hidden>
            ▶
          </span>
          {t.tabs[id]}
        </button>
      ))}
    </nav>
  );
}

export function MapInfo({
  region,
  onRegion,
}: {
  region: Cluster | null;
  onRegion: (region: Cluster | null) => void;
}) {
  const { t } = useI18n();
  const { progress, reset } = useGame();
  const done = objectivesOf(progress);
  const goals: [boolean, string][] = [
    [done.explore, t.objectives.explore(progress.discovered.length, EXPLORE_GOAL)],
    [done.ask, t.objectives.ask],
    [done.trial, t.objectives.trial],
    [done.quest, t.objectives.quest],
    [done.recruit, t.objectives.recruit],
  ];

  return (
    <div className="map-info">
      <h3>{t.objectives.title}</h3>
      <ul className="goals">
        {goals.map(([ok, label]) => (
          <li key={label} className={ok ? 'done' : ''}>
            <span aria-hidden>{ok ? '☑' : '☐'}</span> {label}
          </li>
        ))}
      </ul>

      <h3>{t.map.regions}</h3>
      <ul className="regions">
        {CLUSTERS.map((cluster) => (
          <li key={cluster}>
            <button
              type="button"
              className={region === cluster ? 'active' : ''}
              aria-pressed={region === cluster}
              onClick={() => onRegion(region === cluster ? null : cluster)}
            >
              <i style={{ background: CLUSTER_COLORS[cluster] }} />
              {t.clusters[cluster]}
            </button>
          </li>
        ))}
      </ul>

      <footer>
        <button type="button" className="link" onClick={reset}>
          {t.objectives.reset}
        </button>
        <a className="link" href={CONTACT.repo} target="_blank" rel="noreferrer">
          {t.source} ↗
        </a>
        <small>{t.footer}</small>
      </footer>
    </div>
  );
}

export interface Line {
  /** Changes whenever a different thing is being said, to restart the typing. */
  key: string;
  speaker: string;
  color: string;
  title?: string;
  text: string;
  extra?: ReactNode;
}

export function Dialogue({ line }: { line: Line }) {
  const reducedMotion = useReducedMotion();
  const typed = useTyped(line.text, !reducedMotion, line.key);
  const finished = typed.length >= line.text.length;

  return (
    <section className="dialogue win" aria-live="polite">
      <span className="speaker" style={{ background: line.color }}>
        {line.speaker}
      </span>
      {line.title && <h2>{line.title}</h2>}
      <p>
        {/* Screen readers get the whole line at once; the typing is visual only. */}
        <span className="sr-only">{line.text}</span>
        <span aria-hidden>
          {typed}
          {!finished && <span className="caret">▌</span>}
        </span>
      </p>
      {finished && line.extra}
    </section>
  );
}

export function Toasts() {
  const { toasts } = useGame();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((toast) => (
        <span key={toast.id} className={toast.big ? 'big' : ''}>
          {toast.text}
        </span>
      ))}
    </div>
  );
}
