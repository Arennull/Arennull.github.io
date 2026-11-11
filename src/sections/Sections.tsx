import { useEffect, useRef, useState } from 'react';
import { projects } from '../../content/projects';
import { ChunkingLab } from '../games/ChunkingLab';
import { CloserFarther } from '../games/CloserFarther';
import { RetrieverGame } from '../games/RetrieverGame';
import { useI18n } from '../i18n';
import { CLUSTER_COLORS, CONTACT } from '../i18n/strings';
import { dims, neuronById, neurons } from '../lib/brain';
import { CLUSTERS, type Cluster } from '../lib/types';

export function Header({ onQuickView }: { onQuickView: () => void }) {
  const { t, lang, setLang } = useI18n();
  return (
    <header className="site-header">
      <a className="brand" href="#top">
        <span aria-hidden>◉</span> Alejandro Tiscar
      </a>
      <nav aria-label="Main">
        <a href="#ask">{t.nav.brain}</a>
        <a href="#lab">{t.nav.lab}</a>
        <a href="#projects">{t.nav.projects}</a>
        <a href="#approach">{t.nav.approach}</a>
        <a href="#contact">{t.nav.contact}</a>
      </nav>
      <div className="header-actions">
        <button type="button" className="ghost" onClick={onQuickView}>
          {t.quick}
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

export function Hero({
  cluster,
  onCluster,
}: {
  cluster: Cluster | null;
  onCluster: (cluster: Cluster | null) => void;
}) {
  const { t } = useI18n();
  return (
    <section className="hero" id="top">
      <p className="kicker">
        Alejandro Tiscar · <span>{t.hero.role}</span>
      </p>
      <h1>{t.hero.title}</h1>
      <p className="lead">{t.hero.lead}</p>
      <div className="cta">
        <a className="primary" href="#ask">
          {t.hero.ask}
        </a>
        <a className="secondary" href="#projects">
          {t.hero.projects}
        </a>
      </div>
      <div className="legend">
        <span className="mono muted">{t.hero.legend}</span>
        <ul>
          {CLUSTERS.map((c) => (
            <li key={c}>
              <button
                type="button"
                className={cluster === c ? 'active' : ''}
                aria-pressed={cluster === c}
                onClick={() => onCluster(cluster === c ? null : c)}
              >
                <i style={{ background: CLUSTER_COLORS[c] }} />
                {t.clusters[c]}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="mono muted stats">{t.hero.stats(neurons.length, dims)}</p>
    </section>
  );
}

export function Lab() {
  const { t } = useI18n();
  const [tab, setTab] = useState(0);
  const games = [<RetrieverGame key="r" />, <ChunkingLab key="c" />, <CloserFarther key="d" />];
  return (
    <section className="section" id="lab" aria-labelledby="lab-title">
      <p className="kicker">{t.lab.kicker}</p>
      <h2 id="lab-title">{t.lab.title}</h2>
      <p className="lead">{t.lab.lead}</p>
      <div className="tabs">
        {t.lab.tabs.map((name, i) => (
          <button
            type="button"
            key={name}
            aria-pressed={tab === i}
            className={tab === i ? 'active' : ''}
            onClick={() => setTab(i)}
          >
            <span className="mono">0{i + 1}</span> {name}
          </button>
        ))}
      </div>
      <div>{games[tab]}</div>
    </section>
  );
}

export function Projects({ onShowNeuron }: { onShowNeuron: (index: number) => void }) {
  const { t, lang } = useI18n();
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const show = (neuron: string) => {
    onShowNeuron(neuronById(neuron).index);
    document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section" id="projects" aria-labelledby="projects-title">
      <p className="kicker">{t.projects.kicker}</p>
      <h2 id="projects-title">{t.projects.title}</h2>
      <p className="lead">{t.projects.lead}</p>

      {featured.map((p) => (
        <article className="project featured" key={p.id}>
          <div>
            <h3>{p.name}</h3>
            <p className="project-tagline">{p.tagline[lang]}</p>
            <p>{p.summary[lang]}</p>
            <ul className="points">
              {p.points[lang].map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <ul className="stack mono">
              {p.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="project-links">
              {p.url && (
                <a className="secondary" href={p.url} target="_blank" rel="noreferrer">
                  {t.projects.visit} ↗
                </a>
              )}
              {p.neuron && (
                <button type="button" className="ghost" onClick={() => show(p.neuron!)}>
                  {t.projects.inBrain}
                </button>
              )}
            </div>
          </div>
          <dl className="metrics">
            {p.metrics.map((m) => (
              <div key={m.value}>
                <dt className="mono">{m.value}</dt>
                <dd>{m.label[lang]}</dd>
              </div>
            ))}
          </dl>
        </article>
      ))}

      <h3 className="subhead">{t.projects.more}</h3>
      <div className="project-grid">
        {rest.map((p) => (
          <article className="project" key={p.id}>
            <h4>{p.name}</h4>
            <p className="project-tagline">{p.tagline[lang]}</p>
            <p>{p.summary[lang]}</p>
            <ul className="stack mono">
              {p.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            {p.url && (
              <a href={p.url} target="_blank" rel="noreferrer">
                {t.projects.visit} ↗
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export function Approach() {
  const { t } = useI18n();
  return (
    <section className="section" id="approach" aria-labelledby="approach-title">
      <p className="kicker">{t.approach.kicker}</p>
      <h2 id="approach-title">{t.approach.title}</h2>
      <ol className="approach">
        {t.approach.steps.map((step, i) => (
          <li key={step.name}>
            <span className="mono">0{i + 1}</span>
            <h3>{step.name}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Contact() {
  const { t } = useI18n();
  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <p className="kicker">{t.contact.kicker}</p>
      <h2 id="contact-title">{t.contact.title}</h2>
      <p className="lead">{t.contact.lead}</p>
      <div className="cta">
        <a className="primary" href={`mailto:${CONTACT.email}`}>
          {t.contact.email}
        </a>
        <a className="secondary" href={CONTACT.github} target="_blank" rel="noreferrer">
          {t.contact.github} ↗
        </a>
      </div>
      <p className="mono muted">{CONTACT.email}</p>
      <footer>
        <p className="muted">{t.contact.footer}</p>
        <a href={CONTACT.repo} target="_blank" rel="noreferrer">
          {t.contact.source} ↗
        </a>
      </footer>
    </section>
  );
}

export function QuickView({ open, onClose }: { open: boolean; onClose: () => void }) {
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
      className="quick-view"
      aria-labelledby="quick-view-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div>
        <h2 id="quick-view-title">{t.quickView.title}</h2>
        <ul className="points">
          {t.quickView.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <h3>{t.quickView.projects}</h3>
        <ul className="quick-projects">
          {projects.map((p) => (
            <li key={p.id}>
              <b>{p.name}</b> — {p.tagline[lang]}
            </li>
          ))}
        </ul>
        <h3>{t.quickView.stack}</h3>
        <p className="mono">{t.quickView.stackList}</p>
        <div className="cta">
          <a className="primary" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
          <a className="secondary" href={CONTACT.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <button type="button" className="ghost" onClick={onClose}>
            {t.quickView.close}
          </button>
        </div>
      </div>
    </dialog>
  );
}
