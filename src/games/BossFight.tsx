import { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { CLUSTER_COLORS } from '../i18n/strings';
import { embeddedQueries, neuronById, rankNeurons, retrieve, type Neuron } from '../lib/brain';
import { seeded, shuffle } from '../lib/random';

const DECOYS = 2;
/** Decoys are taken from below this position in the similarity ranking. */
const FAR_RANK = 20;

export interface BossRound {
  queryIndex: number;
  options: Neuron[];
  /** Id of the only option the prepared answer really cites. */
  truth: string;
}

/** One round per prepared question: a fragment its answer cites, among unrelated ones. */
export function buildBossRounds(seed: number): BossRound[] {
  const random = seeded(seed);
  const order = shuffle(
    embeddedQueries.map((_, i) => i),
    random,
  );
  return order.map((queryIndex) => {
    const { query, vec } = embeddedQueries[queryIndex]!;
    const truth = shuffle(query.cites, random)[0]!;
    // Nothing the retrieval would return in either language can be a decoy.
    const sources = new Set(
      (['en', 'es'] as const).flatMap((lang) =>
        retrieve(vec, query.question[lang], lang).final.map((s) => s.item.node.id),
      ),
    );
    const far = rankNeurons(vec)
      .slice(FAR_RANK)
      .map((s) => s.item)
      .filter((n) => !sources.has(n.node.id) && !query.cites.includes(n.node.id));
    const decoys = shuffle(far, random).slice(0, DECOYS);
    return { queryIndex, truth, options: shuffle([neuronById(truth), ...decoys], random) };
  });
}

export function BossFight({ onTurn }: { onTurn: (hits: number, misses: number) => void }) {
  const { t, lang } = useI18n();
  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const rounds = useMemo(() => buildBossRounds(seed), [seed]);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);

  const round = rounds[index % rounds.length]!;
  const question = embeddedQueries[round.queryIndex]!.query.question[lang];

  const choose = (id: string) => {
    if (choice !== null) return;
    setChoice(id);
    if (id === round.truth) onTurn(1, 0);
    else onTurn(0, 1);
  };

  const next = () => {
    setIndex((i) => i + 1);
    setChoice(null);
  };

  return (
    <div className="game">
      <p className="game-intro">{t.boss.intro}</p>
      <h3 className="game-question">{question}</h3>

      <ul className="cards">
        {round.options.map((option) => {
          const id = option.node.id;
          const state =
            choice === null ? '' : id === round.truth ? 'top' : id === choice ? 'miss' : '';
          return (
            <li key={id}>
              <button
                type="button"
                className={`card ${state}`}
                disabled={choice !== null}
                onClick={() => choose(id)}
              >
                <span className="card-title">
                  <i style={{ background: CLUSTER_COLORS[option.node.cluster] }} />
                  {option.node.title[lang]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="game-footer" aria-live="polite">
        {choice !== null && (
          <>
            <strong>{choice === round.truth ? t.closer.right : t.closer.wrong}</strong>
            <button type="button" className="primary" onClick={next}>
              {t.boss.next}
            </button>
          </>
        )}
      </div>
      {choice !== null && (
        <p className="lesson">
          <b>{t.trials.learned}</b> {t.boss.lesson}
        </p>
      )}
    </div>
  );
}
