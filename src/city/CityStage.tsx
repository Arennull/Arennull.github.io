import { Component, lazy, Suspense, useMemo, useRef, useState, type ReactNode } from 'react';
import { useInView, useLowPower, useReducedMotion } from '../hooks';
import { useI18n } from '../i18n';
import { CLUSTER_COLORS, PALETTE } from '../i18n/strings';
import { neurons } from '../lib/brain';
import type { CityQuery } from './CityScene';
import { CITY, LOT } from './layout';

const CityScene = lazy(() => import('./CityScene'));

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    // The 3D library needs WebGL 2; anything older gets the flat plan straight away.
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

interface BoundaryProps {
  fallback: ReactNode;
  onFail: () => void;
  children: ReactNode;
}

class SceneBoundary extends Component<BoundaryProps> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export interface StageProps {
  lit: number[];
  sources: number[];
  selected: number | null;
  /** Tower the hero is standing on. */
  hero: number;
  /** Whether the arrow keys move the hero. */
  keys: boolean;
  discovered: ReadonlySet<number>;
  query: CityQuery | null;
  onSelect: (index: number | null) => void;
}

/** Street plan of the same city seen from above, for browsers without WebGL. */
function City2D({ lit, sources, selected, discovered, onSelect }: StageProps) {
  const { t, lang } = useI18n();
  const active = new Set([...lit, ...sources]);
  const half = CITY.size / 2;
  return (
    <figure className="city2d">
      <svg
        viewBox={`${-half} ${-half} ${CITY.size} ${CITY.size}`}
        role="group"
        aria-label={t.fallback}
      >
        {CITY.fillers.map((f) => (
          <rect
            key={`${f.x},${f.z}`}
            className="city2d-block"
            x={f.x - f.width / 2}
            y={f.z - f.depth / 2}
            width={f.width}
            height={f.depth}
          />
        ))}
        {CITY.towers.map((tower, i) => {
          const n = neurons[i]!;
          const known = discovered.has(i) || active.has(i) || selected === i;
          const size = selected === i ? LOT * 1.25 : LOT;
          const toggle = () => onSelect(selected === i ? null : i);
          return (
            <rect
              key={n.node.id}
              x={tower.x - size / 2}
              y={tower.z - size / 2}
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

export function CityStage(props: StageProps) {
  const { t, lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reducedMotion = useReducedMotion();
  const lowPower = useLowPower();
  const webgl = useMemo(hasWebGL, []);
  const [failed, setFailed] = useState(false);
  const flat = <City2D {...props} />;

  return (
    <div className="city-stage" ref={ref}>
      {webgl ? (
        <SceneBoundary fallback={flat} onFail={() => setFailed(true)}>
          <Suspense fallback={<div className="city-loading" aria-hidden />}>
            <CityScene
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
      <p className="city-hint">
        {webgl && !failed && <span className="keys-hint">{t.map.keys}</span>}
        {t.map.drag}
      </p>
    </div>
  );
}
