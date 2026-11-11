import { Component, lazy, Suspense, useMemo, useRef, type ReactNode } from 'react';
import { useInView, useLowPower, useReducedMotion } from '../hooks';
import { useI18n } from '../i18n';
import { CLUSTER_COLORS } from '../i18n/strings';
import { neighbours, neurons } from '../lib/brain';
import type { BrainQuery } from './BrainScene';
import { toScene } from './shape';

const BrainScene = lazy(() => import('./BrainScene'));

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

interface StageProps {
  lit: number[];
  sources: number[];
  selected: number | null;
  query: BrainQuery | null;
  onSelect: (index: number | null) => void;
}

/** Flat map of the same neurons, for browsers without WebGL. */
function Brain2D({ lit, sources, selected, onSelect }: StageProps) {
  const { t, lang } = useI18n();
  const active = new Set([...lit, ...sources]);
  return (
    <figure className="brain2d">
      <svg viewBox="-1 -0.75 2 1.5" role="img" aria-label={t.fallback}>
        <ellipse cx="0" cy="-0.05" rx="0.93" ry="0.62" className="brain2d-outline" />
        {neurons.map((n, i) => {
          const [x, y] = toScene(n.pos);
          const on = active.size === 0 || active.has(i);
          return (
            <circle
              key={n.node.id}
              cx={x}
              cy={-y}
              r={selected === i ? 0.04 : 0.026}
              fill={CLUSTER_COLORS[n.node.cluster]}
              opacity={on ? 1 : 0.2}
              onClick={() => onSelect(selected === i ? null : i)}
            >
              <title>{n.node.title[lang]}</title>
            </circle>
          );
        })}
      </svg>
      <figcaption>{t.fallback}</figcaption>
    </figure>
  );
}

function NeuronCard({ index, onSelect }: { index: number; onSelect: StageProps['onSelect'] }) {
  const { t, lang } = useI18n();
  const neuron = neurons[index]!;
  const near = useMemo(() => neighbours(neuron, 3), [neuron]);
  const color = CLUSTER_COLORS[neuron.node.cluster];
  return (
    <aside className="neuron-card" style={{ borderColor: color }} aria-live="polite">
      <header>
        <span className="tag" style={{ color }}>
          {t.clusters[neuron.node.cluster]}
        </span>
        <button type="button" className="ghost" onClick={() => onSelect(null)}>
          {t.neuron.close}
        </button>
      </header>
      <h3>{neuron.node.title[lang]}</h3>
      <p>{neuron.node.text[lang]}</p>
      <h4>{t.neuron.neighbours}</h4>
      <ul>
        {near.map((s) => (
          <li key={s.item.node.id}>
            <button type="button" onClick={() => onSelect(s.item.index)}>
              <i style={{ background: CLUSTER_COLORS[s.item.node.cluster] }} />
              {s.item.node.title[lang]}
            </button>
            <span className="mono">
              {t.neuron.cosine} {s.score.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function BrainStage(props: StageProps) {
  const { t, lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reducedMotion = useReducedMotion();
  const lowPower = useLowPower();
  const webgl = useMemo(hasWebGL, []);
  const flat = <Brain2D {...props} />;

  return (
    <div className="brain-stage" ref={ref}>
      {webgl ? (
        <SceneBoundary fallback={flat}>
          <Suspense fallback={<div className="brain-loading" aria-hidden />}>
            <BrainScene
              {...props}
              reducedMotion={reducedMotion}
              lowPower={lowPower}
              active={inView}
              lang={lang}
            />
          </Suspense>
        </SceneBoundary>
      ) : (
        flat
      )}
      {props.selected === null ? (
        <p className="brain-hint mono">{t.hero.hint}</p>
      ) : (
        <NeuronCard index={props.selected} onSelect={props.onSelect} />
      )}
    </div>
  );
}
