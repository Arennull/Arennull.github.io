import { Component, lazy, Suspense, useMemo, useRef, type ReactNode } from 'react';
import { useInView, useLowPower, useReducedMotion } from '../hooks';
import { useI18n } from '../i18n';
import { CLUSTER_COLORS, PALETTE } from '../i18n/strings';
import { neurons } from '../lib/brain';
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

export interface StageProps {
  lit: number[];
  sources: number[];
  selected: number | null;
  discovered: ReadonlySet<number>;
  query: BrainQuery | null;
  onSelect: (index: number | null) => void;
}

/** Flat map of the same neurons, for browsers without WebGL. */
function Brain2D({ lit, sources, selected, discovered, onSelect }: StageProps) {
  const { t, lang } = useI18n();
  const active = new Set([...lit, ...sources]);
  return (
    <figure className="brain2d">
      <svg viewBox="-1 -0.75 2 1.5" role="img" aria-label={t.fallback}>
        <ellipse cx="0" cy="-0.05" rx="0.93" ry="0.62" className="brain2d-outline" />
        {neurons.map((n, i) => {
          const [x, y] = toScene(n.pos);
          const known = discovered.has(i) || active.has(i) || selected === i;
          const size = selected === i ? 0.07 : 0.045;
          const toggle = () => onSelect(selected === i ? null : i);
          return (
            <rect
              key={n.node.id}
              x={x - size / 2}
              y={-y - size / 2}
              width={size}
              height={size}
              fill={known ? CLUSTER_COLORS[n.node.cluster] : PALETTE.slate}
              opacity={active.size === 0 || active.has(i) ? 1 : 0.3}
              role="button"
              tabIndex={0}
              aria-label={known ? n.node.title[lang] : t.map.undiscovered}
              onClick={toggle}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                toggle();
              }}
            />
          );
        })}
      </svg>
      <figcaption>{t.fallback}</figcaption>
    </figure>
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
              unknownLabel={t.map.unknown}
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
      <p className="brain-hint">{t.map.drag}</p>
    </div>
  );
}
