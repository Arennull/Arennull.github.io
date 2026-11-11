import { useState } from 'react';
import { useI18n } from '../i18n';
import { embeddedConcepts, type EmbeddedConcept } from '../lib/brain';
import { cosine } from '../lib/vector';

/** Rounds closer than this are a coin toss even for the model, so they are skipped. */
const MIN_GAP = 0.08;
const BEST_KEY = 'closer-best';

export interface Duel {
  anchor: EmbeddedConcept;
  options: [EmbeddedConcept, EmbeddedConcept];
  scores: [number, number];
}

export function makeDuel(random: () => number, pool = embeddedConcepts): Duel {
  const pick = () => pool[Math.floor(random() * pool.length)]!;
  for (let attempt = 0; attempt < 500; attempt++) {
    const anchor = pick();
    const a = pick();
    const b = pick();
    if (a === anchor || b === anchor || a === b) continue;
    const scores: [number, number] = [cosine(anchor.vec, a.vec), cosine(anchor.vec, b.vec)];
    if (Math.abs(scores[0] - scores[1]) >= MIN_GAP) return { anchor, options: [a, b], scores };
  }
  throw new Error('Could not build a duel: concepts are too close to each other');
}

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

interface Props {
  onScore: (streak: number) => void;
}

export function CloserFarther({ onScore }: Props) {
  const { t, lang } = useI18n();
  const [duel, setDuel] = useState(() => makeDuel(Math.random));
  const [choice, setChoice] = useState<0 | 1 | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(readBest);

  const winner = duel.scores[0] > duel.scores[1] ? 0 : 1;
  const correct = choice === winner;

  const choose = (index: 0 | 1) => {
    if (choice !== null) return;
    setChoice(index);
    const nextStreak = index === winner ? streak + 1 : 0;
    setStreak(nextStreak);
    onScore(nextStreak);
    if (nextStreak > best) {
      setBest(nextStreak);
      try {
        localStorage.setItem(BEST_KEY, String(nextStreak));
      } catch {
        // The record just will not survive a reload.
      }
    }
  };

  const next = () => {
    setDuel(makeDuel(Math.random));
    setChoice(null);
  };

  return (
    <div className="game">
      <p className="game-intro">{t.closer.intro}</p>
      <p className="mono muted">
        {t.closer.streak} {streak} · {t.closer.best} {best}
      </p>

      <div className="duel">
        <div className="anchor">{duel.anchor.concept.label[lang]}</div>
        <div className="duel-options">
          {duel.options.map((option, i) => {
            const index = i as 0 | 1;
            const state =
              choice === null ? '' : index === winner ? 'top' : choice === index ? 'miss' : '';
            return (
              <button
                type="button"
                key={option.concept.id}
                className={`card duel-card ${state}`}
                disabled={choice !== null}
                onClick={() => choose(index)}
              >
                <span className="duel-word">{option.concept.label[lang]}</span>
                {choice !== null && (
                  <span className="card-score mono">
                    <span className="bar">
                      <span style={{ width: `${Math.max(4, duel.scores[index] * 100)}%` }} />
                    </span>
                    {duel.scores[index].toFixed(2)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="game-footer" aria-live="polite">
        {choice !== null && (
          <>
            <strong>{correct ? t.closer.right : t.closer.wrong}</strong>
            <button type="button" className="primary" onClick={next}>
              {t.closer.next}
            </button>
          </>
        )}
      </div>
      {choice !== null && (
        <p className="lesson">
          <b>{t.trials.learned}</b> {t.closer.lesson}
        </p>
      )}
    </div>
  );
}
