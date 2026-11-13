import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { CityQuery } from '../city/CityScene';
import { hoverOver } from '../city/layout';
import { useReducedMotion } from '../hooks';
import { useI18n } from '../i18n';
import { CONTACT } from '../i18n/strings';
import {
  FINAL_K,
  MODES,
  dims,
  embeddedQueries,
  retrieve,
  searchText,
  type Mode,
  type Neuron,
  type Retrieval,
} from '../lib/brain';
import { evaluate, type EvalRow, type Evaluation } from '../lib/eval';
import { LANGS } from '../lib/types';
import type { Scored } from '../lib/vector';
import { useGame } from './progress';

export interface CityFocus {
  lit: number[];
  sources: number[];
  query: CityQuery | null;
}

export const NO_FOCUS: CityFocus = { lit: [], sources: [], query: null };

export interface OracleLine {
  text: string;
  grounded: boolean;
  sources: Neuron[];
}

interface Props {
  onFocus: (focus: CityFocus) => void;
  onLine: (line: OracleLine | null) => void;
  /** Opens the training games. */
  onTrain: () => void;
}

/** What is being asked: one of the prepared questions, or text typed by the visitor. */
type Asked = { kind: 'prepared'; id: string } | { kind: 'free'; text: string };

const STEP_DELAYS = [700, 1500, 2300];
const indices = (list: Scored<Neuron>[]) => list.map((s) => s.item.index);
const position = (list: Scored<Neuron>[], id: string) =>
  list.findIndex((s) => s.item.node.id === id);

/** The sources each way of retrieving would hand over. */
function sourcesBy(mode: Mode, retrieval: Retrieval): Scored<Neuron>[] {
  if (mode === 'hybrid') return retrieval.final;
  return retrieval[mode].slice(0, FINAL_K);
}

const percent = (value: number) => `${Math.round(value * 100)}%`;

function EvalTable({ rows, label }: { rows: EvalRow[]; label: string }) {
  const { t } = useI18n();
  return (
    <>
      {rows.map((row, i) => (
        <tr key={row.mode} className={row.mode === 'hybrid' ? 'best' : ''}>
          {i === 0 && (
            <th rowSpan={rows.length} scope="rowgroup">
              {label}
            </th>
          )}
          <td>{t.oracle.modes[row.mode]}</td>
          <td className="num">{percent(row.recall)}</td>
          <td className="num">{row.mrr.toFixed(2)}</td>
        </tr>
      ))}
    </>
  );
}

/** Scores the retrieval of this very page, in the visitor's browser, when asked to. */
function LiveEvaluation() {
  const { t } = useI18n();
  const [result, setResult] = useState<Evaluation | null>(null);
  return (
    <details className="evaluation">
      <summary>{t.oracle.evaluation.title}</summary>
      <p>{t.oracle.evaluation.note(embeddedQueries.length * LANGS.length)}</p>
      <div className="row">
        <button type="button" className="btn small" onClick={() => setResult(evaluate())}>
          {t.oracle.evaluation.run}
        </button>
        <a
          className="btn small"
          href={`${CONTACT.repo}/blob/main/src/lib/eval.test.ts`}
          target="_blank"
          rel="noreferrer"
        >
          {t.oracle.evaluation.code} ↗
        </a>
      </div>
      {result && (
        <table className="inside" aria-live="polite">
          <thead>
            <tr>
              <td />
              <th>{t.oracle.modes.label}</th>
              <th>{t.oracle.evaluation.recall}</th>
              <th>{t.oracle.evaluation.mrr}</th>
            </tr>
          </thead>
          <tbody>
            <EvalTable rows={result.overall} label={t.oracle.evaluation.all} />
            {LANGS.map((lang) => (
              <EvalTable key={lang} rows={result.byLang[lang]} label={lang.toUpperCase()} />
            ))}
          </tbody>
        </table>
      )}
    </details>
  );
}

export function Oracle({ onFocus, onLine, onTrain }: Props) {
  const { t, lang } = useI18n();
  const { gain, progress } = useGame();
  const reducedMotion = useReducedMotion();
  const [asked, setAsked] = useState<Asked | null>(null);
  const [draft, setDraft] = useState('');
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);
  const [grounded, setGrounded] = useState(true);
  const [mode, setMode] = useState<Mode>('hybrid');

  const prepared =
    asked?.kind === 'prepared'
      ? (embeddedQueries.find((q) => q.query.id === asked.id) ?? null)
      : null;
  const freeText = asked?.kind === 'free' ? asked.text : null;

  const retrieval = useMemo(() => {
    if (prepared) return retrieve(prepared.vec, prepared.query.question[lang], lang);
    return freeText === null ? null : searchText(freeText, lang);
  }, [prepared, freeText, lang]);
  const shown = useMemo(() => (retrieval ? sourcesBy(mode, retrieval) : []), [mode, retrieval]);
  // "From memory" only makes sense for the questions that have a made-up answer written.
  const withSources = grounded || !prepared;

  // Where the question hovers over the city: above the three towers nearest to it in meaning.
  // One object per run, so the scene restarts its animation once per question.
  const query = useMemo(() => {
    if (!retrieval) return null;
    return { key: run, origin: hoverOver(indices(retrieval.vector.slice(0, 3))) };
  }, [retrieval, run]);

  const firstStep = reducedMotion ? 4 : 1;
  if (reducedMotion && retrieval && step !== 4) setStep(4);

  // The handlers put the pipeline on its first step; this only advances it.
  useEffect(() => {
    if (!retrieval || !withSources || reducedMotion) return;
    const timers = STEP_DELAYS.map((delay, i) => window.setTimeout(() => setStep(i + 2), delay));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [retrieval, run, withSources, reducedMotion]);

  // Mirror the current step in the city.
  useEffect(() => {
    if (!retrieval || !query || !withSources || step === 0) {
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
  }, [retrieval, withSources, step, query, onFocus]);

  // Hand the answer to the dialogue box once it is earned.
  const answered = !!retrieval && withSources && step >= 4;
  useEffect(() => {
    const sources = (retrieval?.final ?? []).map((s) => s.item);
    if (freeText !== null && !retrieval) {
      onLine({ text: t.oracle.search.none, grounded: true, sources: [] });
    } else if (prepared && !grounded) {
      onLine({ text: prepared.query.ungrounded[lang], grounded: false, sources: [] });
    } else if (answered && prepared) {
      onLine({ text: prepared.query.answer[lang], grounded: true, sources });
    } else if (answered) {
      onLine({ text: t.oracle.search.note, grounded: true, sources });
    } else {
      onLine(null);
    }
  }, [prepared, freeText, retrieval, grounded, answered, lang, t, onLine]);

  useEffect(() => {
    if (!answered || !retrieval) return;
    if (prepared) gain({ type: 'ask', id: prepared.query.id });
    gain({ type: 'discover', ids: retrieval.final.map((s) => s.item.node.id) });
  }, [answered, prepared, retrieval, gain]);

  // Leaving the Oracle puts the city and the dialogue back to rest.
  useEffect(
    () => () => {
      onFocus(NO_FOCUS);
      onLine(null);
    },
    [onFocus, onLine],
  );

  useEffect(() => {
    setRun((r) => r + 1);
    setStep((current) => (current === 0 ? 0 : firstStep));
  }, [lang, firstStep]);

  const restart = () => {
    setRun((r) => r + 1);
    setStep(firstStep);
  };

  const search = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setAsked({ kind: 'free', text });
    restart();
  };

  const known = new Set(progress.discovered);
  const missing = prepared
    ? prepared.query.cites.filter((id) => position(shown, id) < 0).length
    : 0;
  // Every fragment either half found, in the order the fusion leaves them.
  const rows = retrieval ? retrieval.fused : [];

  return (
    <section className="oracle" aria-labelledby="oracle-title">
      <h2 id="oracle-title">{t.oracle.title}</h2>

      <form className="search" onSubmit={search}>
        <input
          type="search"
          value={draft}
          aria-label={t.oracle.search.label}
          placeholder={t.oracle.search.placeholder}
          maxLength={120}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="btn small">
          {t.oracle.search.go}
        </button>
      </form>

      <div className="toggle" role="group" aria-label={t.oracle.sources} hidden={freeText !== null}>
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
              className={q.id === prepared?.query.id ? 'active' : ''}
              onClick={() => {
                setAsked({ kind: 'prepared', id: q.id });
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

      {retrieval && (
        <ol className="log" aria-live="polite">
          {withSources ? (
            <>
              {step >= 1 && prepared && (
                <li>
                  <span className="bars" aria-hidden>
                    {Array.from(prepared.vec.slice(0, 32)).map((value, i) => (
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
              {step >= 1 && !prepared && <li>{t.oracle.search.seed}</li>}
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

      {answered && retrieval && (
        <details className="under-hood" open>
          <summary>{t.oracle.inside.title}</summary>
          <div className="toggle" role="group" aria-label={t.oracle.modes.label}>
            {MODES.map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={mode === value}
                className={mode === value ? 'active' : ''}
                onClick={() => setMode(value)}
              >
                {t.oracle.modes[value]}
              </button>
            ))}
          </div>
          {missing > 0 && <p className="bad">{t.oracle.inside.missing(missing)}</p>}
          <table className="inside">
            <thead>
              <tr>
                <th>{t.oracle.inside.fragment}</th>
                <th>{t.oracle.modes.vector}</th>
                <th>{t.oracle.modes.lexical}</th>
                <th>{t.oracle.inside.merged}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item }, fused) => {
                const id = item.node.id;
                const byMeaning = position(retrieval.vector, id);
                const byWords = position(retrieval.lexical, id);
                const named = known.has(id) || position(retrieval.final, id) >= 0;
                return (
                  <tr key={id} className={position(shown, id) >= 0 ? 'best' : ''}>
                    <td>{named ? item.node.title[lang] : t.map.unknown}</td>
                    <td className="num">
                      {byMeaning < 0
                        ? '—'
                        : `#${byMeaning + 1} · ${retrieval.vector[byMeaning]!.score.toFixed(2)}`}
                    </td>
                    <td className="num">
                      {byWords < 0
                        ? '—'
                        : `#${byWords + 1} · ${retrieval.lexical[byWords]!.score.toFixed(1)}`}
                    </td>
                    <td className="num">#{fused + 1}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </details>
      )}

      <LiveEvaluation />
      <button type="button" className="btn small train" onClick={onTrain}>
        {t.oracle.train} ▸
      </button>
    </section>
  );
}
