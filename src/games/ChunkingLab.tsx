import { useMemo, useState } from 'react';
import { CHUNK_OVERLAPS, CHUNK_SIZES } from '../../content/games';
import { useI18n } from '../i18n';
import {
  chunkingQuestions,
  chunkingText,
  labChunks,
  labQuestionVec,
  type LabChunk,
} from '../lib/brain';
import { containsAnswer } from '../lib/chunker';
import type { Lang } from '../lib/types';
import { rank } from '../lib/vector';

export interface LabResult {
  chunks: (LabChunk & { rank: number; score: number; whole: boolean })[];
  /** Rank of the best chunk that holds the whole answer, or 0 if none does. */
  answerRank: number;
  contextChars: number;
}

export function runLab(lang: Lang, size: number, overlap: number, questionId: string): LabResult {
  const question = chunkingQuestions.find((q) => q.id === questionId)!;
  const chunks = labChunks(lang, size, overlap);
  const ranked = rank(labQuestionVec(lang, questionId), chunks, (c) => c.vec);
  const rankOf = new Map(ranked.map((r, i) => [r.item, { rank: i + 1, score: r.score }]));
  const text = chunkingText[lang];
  const scored = chunks.map((c) => ({
    ...c,
    ...rankOf.get(c)!,
    whole: containsAnswer(c, text, question.answer[lang]),
  }));
  const holders = scored.filter((c) => c.whole).map((c) => c.rank);
  return {
    chunks: scored,
    answerRank: holders.length > 0 ? Math.min(...holders) : 0,
    contextChars: ranked.slice(0, 3).reduce((sum, r) => sum + r.item.text.length, 0),
  };
}

export function ChunkingLab() {
  const { t, lang } = useI18n();
  const [size, setSize] = useState<number>(CHUNK_SIZES[1]);
  const [overlap, setOverlap] = useState<number>(CHUNK_OVERLAPS[0]);
  const [questionId, setQuestionId] = useState(chunkingQuestions[1]!.id);

  const result = useMemo(
    () => runLab(lang, size, overlap, questionId),
    [lang, size, overlap, questionId],
  );

  const verdict =
    result.answerRank === 1
      ? { kind: 'ok', text: t.chunking.verdictOk }
      : result.answerRank > 1
        ? { kind: 'warn', text: t.chunking.verdictLow(result.answerRank) }
        : { kind: 'bad', text: t.chunking.verdictSplit };

  return (
    <div className="game">
      <p className="game-intro">{t.chunking.intro}</p>

      <div className="lab-controls">
        <fieldset>
          <legend>{t.chunking.size}</legend>
          {CHUNK_SIZES.map((s) => (
            <button
              type="button"
              key={s}
              className={s === size ? 'active' : ''}
              aria-pressed={s === size}
              onClick={() => setSize(s)}
            >
              {s} <small>{t.chunking.chars}</small>
            </button>
          ))}
        </fieldset>
        <fieldset>
          <legend>{t.chunking.overlap}</legend>
          {CHUNK_OVERLAPS.map((o) => (
            <button
              type="button"
              key={o}
              className={o === overlap ? 'active' : ''}
              aria-pressed={o === overlap}
              onClick={() => setOverlap(o)}
            >
              {Math.round(o * 100)}%
            </button>
          ))}
        </fieldset>
        <fieldset className="wide">
          <legend>{t.chunking.question}</legend>
          {chunkingQuestions.map((q) => (
            <button
              type="button"
              key={q.id}
              className={q.id === questionId ? 'active' : ''}
              aria-pressed={q.id === questionId}
              onClick={() => setQuestionId(q.id)}
            >
              {q.question[lang]}
            </button>
          ))}
        </fieldset>
      </div>

      <p className={`verdict ${verdict.kind}`} aria-live="polite">
        {verdict.text}{' '}
        <span className="mono">
          {t.chunking.chunks(result.chunks.length)} · {t.chunking.context(result.contextChars)}
        </span>
      </p>

      <ol className="chunks">
        {result.chunks.map((c) => (
          <li
            key={`${c.start}-${c.end}`}
            className={`${c.rank <= 3 ? 'retrieved' : ''} ${c.whole ? 'whole' : ''}`}
          >
            <span className="chunk-meta mono">
              {c.rank <= 3 && (
                <b>
                  #{c.rank} {t.chunking.top}
                </b>
              )}
              <span>{c.score.toFixed(2)}</span>
              {c.whole && <em>{t.chunking.hasAnswer}</em>}
            </span>
            {c.text}
          </li>
        ))}
      </ol>

      <p className="lesson">
        <b>{t.lab.learned}</b> {t.chunking.lesson}
      </p>
    </div>
  );
}
