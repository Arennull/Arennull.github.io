import { useEffect, useMemo, useState } from 'react';
import type { BrainQuery } from '../brain/BrainScene';
import { toScene } from '../brain/shape';
import { useReducedMotion } from '../hooks';
import { useI18n } from '../i18n';
import { dims, embeddedQueries, rankNeurons, retrieve, type Neuron } from '../lib/brain';
import type { Scored } from '../lib/vector';
import { useGame } from './progress';

export interface BrainFocus {
  lit: number[];
  sources: number[];
  query: BrainQuery | null;
}

export const NO_FOCUS: BrainFocus = { lit: [], sources: [], query: null };

export interface OracleLine {
  text: string;
  grounded: boolean;
  sources: Neuron[];
}

interface Props {
  onFocus: (focus: BrainFocus) => void;
  onLine: (line: OracleLine | null) => void;
}

const STEP_DELAYS = [700, 1500, 2300];
const indices = (list: Scored<Neuron>[]) => list.map((s) => s.item.index);

export function Oracle({ onFocus, onLine }: Props) {
  const { t, lang } = useI18n();
  const { gain, progress } = useGame();
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);
  const [grounded, setGrounded] = useState(true);

  const active = embeddedQueries.find((q) => q.query.id === activeId) ?? null;
  const retrieval = useMemo(
    () => (active ? retrieve(active.vec, active.query.question[lang], lang) : null),
    [active, lang],
  );

  // Where the question lands in the brain: between its three nearest neurons.
  // One object per run, so the scene restarts its animation once per question.
  const query = useMemo(() => {
    if (!active) return null;
    const top = rankNeurons(active.vec)
      .slice(0, 3)
      .map((s) => toScene(s.item.pos));
    const origin = [0, 1, 2].map((d) => top.reduce((sum, p) => sum + p[d]!, 0) / top.length) as [
      number,
      number,
      number,
    ];
    return { key: run, origin };
  }, [active, run]);

  const firstStep = reducedMotion ? 4 : 1;
  if (reducedMotion && active && step !== 4) setStep(4);

  // The handlers put the pipeline on its first step; this only advances it.
  useEffect(() => {
    if (!active || !grounded || reducedMotion) return;
    const timers = STEP_DELAYS.map((delay, i) => window.setTimeout(() => setStep(i + 2), delay));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [active, run, grounded, reducedMotion]);

  // Mirror the current step in the brain.
  useEffect(() => {
    if (!retrieval || !query || !grounded || step === 0) {
      onFocus(NO_FOCUS);
    } else if (step === 1) {
      onFocus({ lit: [], sources: [], query });
    } else if (step === 2) {
      const hits = [...new Set([...indices(retrieval.vector), ...indices(retrieval.lexical)])];
      onFocus({ lit: hits, sources: [], query });
    } else if (step === 3) {
      onFocus({ lit: indices(retrieval.fused.slice(0, 8)), sources: [], query });
    } else {
      onFocus({ lit: indices(retrieval.final), sources: indices(retrieval.final), query });
    }
  }, [retrieval, grounded, step, query, onFocus]);

  // Hand the answer to the dialogue box and pay out once it is earned.
  const answered = !!active && !!retrieval && grounded && step >= 4;
  useEffect(() => {
    if (!active || !retrieval) {
      onLine(null);
    } else if (!grounded) {
      onLine({ text: active.query.ungrounded[lang], grounded: false, sources: [] });
    } else if (answered) {
      onLine({
        text: active.query.answer[lang],
        grounded: true,
        sources: retrieval.final.map((s) => s.item),
      });
    } else {
      onLine(null);
    }
  }, [active, retrieval, grounded, answered, lang, onLine]);

  useEffect(() => {
    if (!answered || !active || !retrieval) return;
    gain({ type: 'ask', id: active.query.id });
    gain({ type: 'discover', ids: retrieval.final.map((s) => s.item.node.id) });
  }, [answered, active, retrieval, gain]);

  // Leaving the Oracle puts the brain and the dialogue back to rest.
  useEffect(
    () => () => {
      onFocus(NO_FOCUS);
      onLine(null);
    },
    [onFocus, onLine],
  );

  const restart = () => {
    setRun((r) => r + 1);
    setStep(firstStep);
  };

  return (
    <section className="oracle" aria-labelledby="oracle-title">
      <h2 id="oracle-title">{t.oracle.title}</h2>

      <div className="toggle" role="group" aria-label={t.oracle.sources}>
        {[true, false].map((value) => (
          <button
            type="button"
            key={String(value)}
            aria-pressed={grounded === value}
            className={grounded === value ? 'active' : ''}
            onClick={() => {
              setGrounded(value);
              restart();
            }}
          >
            {value ? t.oracle.on : t.oracle.off}
          </button>
        ))}
      </div>

      <ul className="choices">
        {embeddedQueries.map(({ query: q }) => (
          <li key={q.id}>
            <button
              type="button"
              className={q.id === activeId ? 'active' : ''}
              onClick={() => {
                setActiveId(q.id);
                restart();
              }}
            >
              <span className="cursor" aria-hidden>
                ▶
              </span>
              {q.question[lang]}
              {progress.asked.includes(q.id) && (
                <span className="tick" aria-hidden>
                  ✓
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {active && retrieval && (
        <ol className="log" aria-live="polite">
          {grounded ? (
            <>
              {step >= 1 && (
                <li>
                  <span className="bars" aria-hidden>
                    {Array.from(active.vec.slice(0, 32)).map((value, i) => (
                      <i
                        key={i}
                        className={value < 0 ? 'neg' : ''}
                        style={{ height: `${Math.min(100, 12 + Math.abs(value) * 560)}%` }}
                      />
                    ))}
                  </span>
                  {t.oracle.log.embed(dims)}
                </li>
              )}
              {step >= 2 && (
                <li>{t.oracle.log.search(retrieval.vector.length, retrieval.lexical.length)}</li>
              )}
              {step >= 3 && <li>{t.oracle.log.fuse(retrieval.final.length)}</li>}
            </>
          ) : (
            <li className="bad">{t.oracle.ungrounded}</li>
          )}
        </ol>
      )}
    </section>
  );
}
