import { useEffect, useMemo, useState } from 'react';
import type { BrainQuery } from '../brain/BrainScene';
import { toScene } from '../brain/shape';
import { useReducedMotion, useTyped } from '../hooks';
import { useI18n } from '../i18n';
import { CLUSTER_COLORS } from '../i18n/strings';
import { dims, embeddedQueries, FINAL_K, retrieve, type Neuron } from '../lib/brain';
import type { Scored } from '../lib/vector';

export interface BrainFocus {
  lit: number[];
  sources: number[];
  query: BrainQuery | null;
}

export const NO_FOCUS: BrainFocus = { lit: [], sources: [], query: null };

interface Props {
  onFocus: (focus: BrainFocus) => void;
  onSelect: (index: number | null) => void;
}

const STEP_DELAYS = [0, 800, 1700, 2600];

function ResultList({
  title,
  results,
  format,
  empty,
}: {
  title: string;
  results: Scored<Neuron>[];
  format: (score: number) => string;
  empty: string;
}) {
  const { lang } = useI18n();
  return (
    <div className="result-list">
      <h4>{title}</h4>
      {results.length === 0 && <p className="muted">{empty}</p>}
      <ol>
        {results.slice(0, 5).map((r) => (
          <li key={r.item.node.id}>
            <i style={{ background: CLUSTER_COLORS[r.item.node.cluster] }} />
            <span>{r.item.node.title[lang]}</span>
            <b className="mono">{format(r.score)}</b>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function AskMyBrain({ onFocus, onSelect }: Props) {
  const { t, lang } = useI18n();
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);
  const [retrievalOn, setRetrievalOn] = useState(true);

  const active = embeddedQueries.find((q) => q.query.id === activeId) ?? null;
  const retrieval = useMemo(
    () => (active ? retrieve(active.vec, active.query.question[lang], lang) : null),
    [active, lang],
  );

  // Advance the pipeline one step at a time.
  useEffect(() => {
    if (!active || !retrievalOn) return;
    if (reducedMotion) {
      setStep(4);
      return;
    }
    setStep(1);
    const timers = STEP_DELAYS.slice(1).map((delay, i) =>
      window.setTimeout(() => setStep(i + 2), delay),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [active, run, retrievalOn, reducedMotion]);

  // Mirror the current step in the 3D brain.
  useEffect(() => {
    if (!retrieval || !retrievalOn || step === 0) {
      onFocus(NO_FOCUS);
      return;
    }
    const top = retrieval.vector.slice(0, 3).map((s) => toScene(s.item.pos));
    const origin = [0, 1, 2].map((d) => top.reduce((sum, p) => sum + p[d]!, 0) / top.length) as [
      number,
      number,
      number,
    ];
    const query = { key: run, origin };
    const indices = (list: Scored<Neuron>[]) => list.map((s) => s.item.index);
    if (step === 1) onFocus({ lit: [], sources: [], query });
    else if (step === 2) {
      onFocus({
        lit: [...new Set([...indices(retrieval.vector), ...indices(retrieval.lexical)])],
        sources: [],
        query,
      });
    } else if (step === 3)
      onFocus({ lit: indices(retrieval.fused.slice(0, 8)), sources: [], query });
    else onFocus({ lit: indices(retrieval.final), sources: indices(retrieval.final), query });
  }, [retrieval, retrievalOn, step, run, onFocus]);

  const answerText = active
    ? retrievalOn
      ? active.query.answer[lang]
      : active.query.ungrounded[lang]
    : '';
  const showAnswer = !!active && (!retrievalOn || step >= 4);
  const typed = useTyped(answerText, showAnswer && !reducedMotion);

  const place = (list: Scored<Neuron>[], id: string) =>
    list.findIndex((s) => s.item.node.id === id) + 1;

  const ask = (id: string) => {
    setActiveId(id);
    setRun((r) => r + 1);
    onSelect(null);
    // The results render below the question list; bring them into view.
    requestAnimationFrame(() => {
      document.getElementById('ask-output')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  };

  return (
    <section className="ask" id="ask" aria-labelledby="ask-title">
      <p className="kicker">{t.ask.kicker}</p>
      <h2 id="ask-title">{t.ask.title}</h2>
      <p className="lead">{t.ask.lead}</p>

      <div className="ask-controls">
        <span className="mono">{t.ask.retrieval}</span>
        <button
          type="button"
          role="switch"
          aria-checked={retrievalOn}
          className={`switch ${retrievalOn ? 'on' : ''}`}
          onClick={() => setRetrievalOn((v) => !v)}
        >
          <i />
          <span>{retrievalOn ? t.ask.on : t.ask.off}</span>
        </button>
      </div>

      <ul className="questions">
        {embeddedQueries.map(({ query }) => (
          <li key={query.id}>
            <button
              type="button"
              className={query.id === activeId ? 'active' : ''}
              onClick={() => ask(query.id)}
            >
              {query.question[lang]}
            </button>
          </li>
        ))}
      </ul>

      <div id="ask-output" />
      {!active && <p className="muted ask-empty">{t.ask.pick}</p>}

      {active && retrievalOn && retrieval && (
        <div className="pipeline">
          <ol className="steps mono" aria-hidden>
            {t.ask.steps.map((name, i) => (
              <li key={name} className={step > i ? 'done' : ''}>
                <b>{i + 1}</b>
                {name}
              </li>
            ))}
          </ol>

          {step >= 1 && (
            <div className="panel">
              <div className="vector-bars" aria-hidden>
                {Array.from(active.vec.slice(0, 64)).map((value, i) => (
                  <i
                    key={i}
                    className={value < 0 ? 'neg' : ''}
                    style={{ height: `${Math.min(100, Math.abs(value) * 620)}%` }}
                  />
                ))}
              </div>
              <p className="muted">{t.ask.embedNote(dims)}</p>
            </div>
          )}

          {step >= 2 && (
            <div className="panel two">
              <ResultList
                title={t.ask.vector}
                results={retrieval.vector}
                format={(s) => s.toFixed(2)}
                empty=""
              />
              <ResultList
                title={t.ask.lexical}
                results={retrieval.lexical}
                format={(s) => s.toFixed(1)}
                empty={t.ask.none}
              />
            </div>
          )}

          {step >= 3 && (
            <div className="panel">
              <div className="result-list">
                <h4>{t.ask.fused}</h4>
                <ol>
                  {retrieval.fused.slice(0, FINAL_K).map((r) => {
                    const v = place(retrieval.vector, r.item.node.id);
                    const k = place(retrieval.lexical, r.item.node.id);
                    return (
                      <li key={r.item.node.id}>
                        <i style={{ background: CLUSTER_COLORS[r.item.node.cluster] }} />
                        <span>{r.item.node.title[lang]}</span>
                        <b className="mono badges">
                          {v > 0 && <em>V#{v}</em>}
                          {k > 0 && <em>K#{k}</em>}
                        </b>
                      </li>
                    );
                  })}
                </ol>
              </div>
              <p className="muted">{t.ask.fusedNote}</p>
            </div>
          )}
        </div>
      )}

      {showAnswer && active && (
        <div className={`answer ${retrievalOn ? '' : 'ungrounded'}`} aria-live="polite">
          <h4>{retrievalOn ? t.ask.answer : t.ask.ungrounded}</h4>
          <p>{typed}</p>
          {retrievalOn && retrieval ? (
            <div className="sources">
              <span className="mono">{t.ask.sources}</span>
              {retrieval.final.map((s, i) => (
                <button
                  type="button"
                  key={s.item.node.id}
                  className={active.query.cites.includes(s.item.node.id) ? 'cited' : ''}
                  onClick={() => onSelect(s.item.index)}
                >
                  <b>{i + 1}</b>
                  {s.item.node.title[lang]}
                </button>
              ))}
              <button type="button" className="ghost" onClick={() => setRun((r) => r + 1)}>
                {t.ask.replay}
              </button>
            </div>
          ) : (
            <p className="warning">{t.ask.ungroundedNote}</p>
          )}
        </div>
      )}
    </section>
  );
}
