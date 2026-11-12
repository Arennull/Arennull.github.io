import type { Lang } from '../src/lib/types';

/**
 * What the version history of each source repository says about my part in it,
 * counted with `git log --no-merges --all` and my commit address. Dates are
 * the months of my first and last commit there.
 */
export interface ProjectFacts {
  /** [first, last] month, as YYYY-MM. */
  period: [string, string];
  /** My commits and, where the history is the team's own, every commit in the repository. */
  commits: { mine: number; total?: number };
  /** Choices written down in the repository, each with what was turned down and why. */
  decisions?: Record<Lang, string[]>;
}

export const projectFacts: Record<string, ProjectFacts> = {
  sangi: {
    period: ['2026-05', '2026-11'],
    commits: { mine: 1119, total: 1124 },
    decisions: {
      en: [
        'Merge by rank, not by score: scores are not comparable from one query to the next, and normalising them did worst on the held-out cases (0.70 against 0.73).',
        'No reranker: it lowered recall@10 from 0.92 to 0.85, added about 4.8 s at the median and returned identifiers that did not exist.',
        'In the chat evaluation, once its held-out set had been used to tune rules it was demoted to regression, and a new validation set was drawn by hash.',
        'The old fallback survives as a frozen copy for comparisons, not as a switch inside production code.',
      ],
      es: [
        'Fusionar por posición y no por puntuación: las puntuaciones no son comparables de una consulta a otra, y normalizarlas fue lo peor en los casos de reserva (0,70 frente a 0,73).',
        'Sin reranker: bajaba el recall@10 de 0,92 a 0,85, añadía unos 4,8 s de mediana y devolvía identificadores que no existían.',
        'En la evaluación del chat, cuando su conjunto de reserva ya se había usado para ajustar reglas pasó a ser de regresión, y se sacó por hash uno nuevo de validación.',
        'El mecanismo antiguo se conserva como copia congelada para comparar, no como un interruptor dentro del código de producción.',
      ],
      ja: [
        'スコアではなく順位で融合。スコアはクエリごとに比較できず、正規化はホールドアウトで最も悪い結果でした(0.70対0.73)。',
        'リランカーは不採用。recall@10が0.92から0.85に下がり、中央値で約4.8秒増え、存在しないIDを返しました。',
        'チャットの評価では、ホールドアウトをルールの調整に使った時点で回帰用に格下げし、ハッシュで新しい検証セットを選び直しました。',
        '旧方式は比較用の凍結コピーとして残し、本番コード内のスイッチにはしていません。',
      ],
    },
  },
  jairofitness: {
    period: ['2026-10', '2026-11'],
    commits: { mine: 1429, total: 2638 },
    decisions: {
      en: [
        'The stronger chat model: 31% against 19% for the cheaper one on the blind judge, at about five times the cost per message.',
        'The judge model is pinned apart from the chat model; changing both at once made the comparisons meaningless.',
        'Deep reasoning off: turning it up changed the replies little and took p95 from 1.7 s to between 4 and 6 s.',
        'The persona is data, but safety and product rules stay in code, so swapping the persona cannot drop a rule.',
      ],
      es: [
        'El modelo de chat más capaz: 31 % frente al 19 % del barato ante el juez a ciegas, a unas cinco veces el coste por mensaje.',
        'El modelo que hace de juez está fijado aparte del de chat; cambiar los dos a la vez dejaba las comparaciones sin sentido.',
        'Razonamiento profundo apagado: subirlo cambiaba poco las respuestas y llevaba el p95 de 1,7 s a entre 4 y 6 s.',
        'La persona es un dato, pero las reglas de seguridad y de producto siguen en código: cambiar la persona no puede quitar una regla.',
      ],
      ja: [
        'より強力なチャットモデルを採用。ブラインド審査で31%、安価なモデルは19%。1メッセージあたりのコストは約5倍です。',
        '審査役のモデルはチャットモデルと別に固定。両方を同時に変えると比較が意味を失いました。',
        '深い推論はオフ。上げても応答はほとんど変わらず、p95が1.7秒から4〜6秒に伸びました。',
        'ペルソナはデータですが、安全と製品のルールはコードに残します。ペルソナを差し替えてもルールは外れません。',
      ],
    },
  },
  'market-movers': { period: ['2026-05', '2026-11'], commits: { mine: 360, total: 480 } },
  proyectasport: { period: ['2026-04', '2026-11'], commits: { mine: 1205, total: 1247 } },
  catalyst: { period: ['2026-07', '2026-11'], commits: { mine: 255, total: 367 } },
  'private-equity': { period: ['2026-11', '2026-11'], commits: { mine: 2, total: 313 } },
  // The repository carries the whole history of the open-source project underneath.
  abacus: { period: ['2026-08', '2026-08'], commits: { mine: 19 } },
  pitlane: { period: ['2026-02', '2026-11'], commits: { mine: 113, total: 113 } },
  showhome: { period: ['2026-04', '2026-11'], commits: { mine: 78, total: 78 } },
  kettlebell: { period: ['2026-11', '2026-11'], commits: { mine: 37, total: 515 } },
  apothecary: { period: ['2026-10', '2026-11'], commits: { mine: 15, total: 41 } },
  signpost: { period: ['2026-08', '2026-11'], commits: { mine: 171, total: 178 } },
};

export type Part = 'lead' | 'co' | 'contributor';

/** Main author from nine commits in ten, co-author from half; below that, a contributor. */
export function partOf(commits: ProjectFacts['commits']): Part {
  if (commits.total === undefined) return 'contributor';
  const share = commits.mine / commits.total;
  return share >= 0.9 ? 'lead' : share >= 0.5 ? 'co' : 'contributor';
}

/** What goes on the CV besides the projects. */
export const profile = {
  /** Month of my first commit at the agency, as YYYY-MM. */
  since: '2026-02',
};
