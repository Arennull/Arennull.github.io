import { FINAL_K, MODES, embeddedQueries, rankBy, type Mode } from './brain';
import { LANGS, type Lang } from './types';

/** Share of the relevant items found among the first `k` results. */
export function recallAt(ranked: string[], relevant: string[], k: number): number {
  if (relevant.length === 0) return 1;
  const top = new Set(ranked.slice(0, k));
  return relevant.filter((id) => top.has(id)).length / relevant.length;
}

/** One over the position of the first relevant result; zero when there is none. */
export function reciprocalRank(ranked: string[], relevant: string[]): number {
  const at = ranked.findIndex((id) => relevant.includes(id));
  return at < 0 ? 0 : 1 / (at + 1);
}

export interface EvalRow {
  mode: Mode;
  /** Mean recall at FINAL_K: do the sources the answer cites reach the model? */
  recall: number;
  /**
   * Mean reciprocal rank: how high is the first of them? Each way is scored on
   * the list it really produces, so "both" only sees what either half put in
   * its top results, as it does on the page.
   */
  mrr: number;
}

export interface Evaluation {
  /** Questions times languages. */
  cases: number;
  overall: EvalRow[];
  byLang: Record<Lang, EvalRow[]>;
}

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / (values.length || 1);

/**
 * Runs every prepared question, in every language, through each way of
 * retrieving, and scores it against the fragments its answer cites.
 */
export function evaluate(): Evaluation {
  const score = (langs: Lang[], mode: Mode): EvalRow => {
    const runs = langs.flatMap((lang) =>
      embeddedQueries.map(({ query, vec }) => {
        const ranked = rankBy(mode, vec, query.question[lang], lang).map((n) => n.node.id);
        return {
          recall: recallAt(ranked, query.cites, FINAL_K),
          rr: reciprocalRank(ranked, query.cites),
        };
      }),
    );
    return { mode, recall: mean(runs.map((r) => r.recall)), mrr: mean(runs.map((r) => r.rr)) };
  };
  return {
    cases: embeddedQueries.length * LANGS.length,
    overall: MODES.map((mode) => score(LANGS, mode)),
    byLang: Object.fromEntries(
      LANGS.map((lang) => [lang, MODES.map((mode) => score([lang], mode))]),
    ) as Record<Lang, EvalRow[]>,
  };
}
