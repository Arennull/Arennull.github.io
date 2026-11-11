import { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { CLUSTER_COLORS } from '../i18n/strings';
import { embeddedQueries, rankNeurons, type Neuron } from '../lib/brain';
import { seeded, shuffle } from '../lib/random';
import type { Scored } from '../lib/vector';

const ROUNDS = 3;
const TOP = 3;
const CANDIDATES = 8;

interface Round {
  queryIndex: number;
  /** Candidates in the shuffled order shown to the player. */
  candidates: Scored<Neuron>[];
  /** Ids of the real top 3. */
  top: string[];
}

/** The real top 3 plus distractors taken from further down the ranking. */
export function buildRounds(seed: number): Round[] {
  const random = seeded(seed);
  const order = shuffle(
    embeddedQueries.map((_, i) => i),
    random,
  ).slice(0, ROUNDS);
  return order.map((queryIndex) => {
    const ranked = rankNeurons(embeddedQueries[queryIndex]!.vec);
    const top = ranked.slice(0, TOP);
    const distractors = shuffle(ranked.slice(TOP, 22), random).slice(0, CANDIDATES - TOP);
    return {
      queryIndex,
      candidates: shuffle([...top, ...distractors], random),
      top: top.map((s) => s.item.node.id),
    };
  });
}

export function RetrieverGame({ onScore }: { onScore: (hits: number) => void }) {
  const { t, lang } = useI18n();
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const rounds = useMemo(() => buildRounds(seed), [seed]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [total, setTotal] = useState(0);

  const round = rounds[roundIndex]!;
  const question = embeddedQueries[round.queryIndex]!.query.question[lang];
  const hits = picked.filter((id) => round.top.includes(id)).length;
  const last = roundIndex === ROUNDS - 1;
  const shown = revealed
    ? [...round.candidates].sort((a, b) => b.score - a.score)
    : round.candidates;
  const best = Math.max(...round.candidates.map((c) => c.score));

  const toggle = (id: string) => {
    if (revealed) return;
    setPicked((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : p.length < TOP ? [...p, id] : p,
    );
  };

  const reveal = () => {
    setRevealed(true);
    setTotal(total + hits);
    onScore(total + hits);
  };

  const next = () => {
    if (last) {
      setSeed(Math.floor(Math.random() * 1e9));
      setRoundIndex(0);
      setTotal(0);
    } else {
      setRoundIndex((i) => i + 1);
    }
    setPicked([]);
    setRevealed(false);
  };

  return (
    <div className="game">
      <p className="game-intro">{t.retriever.intro}</p>
      <p className="mono muted">{t.retriever.round(roundIndex + 1, ROUNDS)}</p>
      <h3 className="game-question">{question}</h3>

      <ul className="cards">
        {shown.map((c) => {
          const id = c.item.node.id;
          const isPicked = picked.includes(id);
          const isTop = round.top.includes(id);
          const state = revealed
            ? isTop
              ? 'top'
              : isPicked
                ? 'miss'
                : ''
            : isPicked
              ? 'picked'
              : '';
          return (
            <li key={id}>
              <button
                type="button"
                className={`card ${state}`}
                aria-pressed={isPicked}
                onClick={() => toggle(id)}
              >
                <span className="card-title">
                  <i style={{ background: CLUSTER_COLORS[c.item.node.cluster] }} />
                  {c.item.node.title[lang]}
                </span>
                <span className="card-text">{c.item.node.text[lang]}</span>
                {revealed && (
                  <span className="card-score mono">
                    <span className="bar">
                      <span style={{ width: `${Math.max(4, (c.score / best) * 100)}%` }} />
                    </span>
                    {c.score.toFixed(2)}
                    {isPicked && <em>{t.retriever.yours}</em>}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="game-footer" aria-live="polite">
        {revealed ? (
          <>
            <strong>
              {t.retriever.score(hits)}
              {last && ` · ${t.retriever.total(total, ROUNDS * TOP)}`}
            </strong>
            <button type="button" className="primary" onClick={next}>
              {last ? t.retriever.again : t.retriever.next}
            </button>
          </>
        ) : (
          <>
            <span className="mono muted">{t.retriever.picked(picked.length)}</span>
            <button
              type="button"
              className="primary"
              disabled={picked.length !== TOP}
              onClick={reveal}
            >
              {t.retriever.check}
            </button>
          </>
        )}
      </div>
      {revealed && (
        <p className="lesson">
          <b>{t.trials.learned}</b> {t.retriever.lesson}
        </p>
      )}
    </div>
  );
}
