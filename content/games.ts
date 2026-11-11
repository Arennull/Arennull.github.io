import type { ChunkingQuestion, Concept, L10n, Lang } from '../src/lib/types';

/** Terms for the "closer or farther" game. A mix of AI and everyday words on purpose. */
export const concepts: Concept[] = [
  {
    id: 'c-vector-db',
    label: { en: 'vector database', es: 'base de datos vectorial', ja: 'ベクトルデータベース' },
  },
  { id: 'c-search', label: { en: 'search engine', es: 'buscador', ja: '検索エンジン' } },
  { id: 'c-library', label: { en: 'library', es: 'biblioteca', ja: '図書館' } },
  { id: 'c-memory', label: { en: 'memory', es: 'memoria', ja: 'メモリ' } },
  { id: 'c-brain', label: { en: 'brain', es: 'cerebro', ja: '脳' } },
  { id: 'c-neuron', label: { en: 'neuron', es: 'neurona', ja: 'ニューロン' } },
  {
    id: 'c-hallucination',
    label: { en: 'hallucination', es: 'alucinación', ja: 'ハルシネーション' },
  },
  { id: 'c-lie', label: { en: 'lie', es: 'mentira', ja: '嘘' } },
  { id: 'c-dream', label: { en: 'dream', es: 'sueño', ja: '夢' } },
  { id: 'c-translation', label: { en: 'translation', es: 'traducción', ja: '翻訳' } },
  { id: 'c-dictionary', label: { en: 'dictionary', es: 'diccionario', ja: '辞書' } },
  { id: 'c-map', label: { en: 'map', es: 'mapa', ja: '地図' } },
  { id: 'c-compass', label: { en: 'compass', es: 'brújula', ja: '方位磁針' } },
  { id: 'c-distance', label: { en: 'distance', es: 'distancia', ja: '距離' } },
  { id: 'c-sneaker', label: { en: 'sneaker', es: 'zapatilla', ja: 'スニーカー' } },
  { id: 'c-boot', label: { en: 'boot', es: 'bota', ja: 'ブーツ' } },
  {
    id: 'c-coach',
    label: { en: 'fitness coach', es: 'entrenador personal', ja: 'フィットネスコーチ' },
  },
  { id: 'c-gym', label: { en: 'gym', es: 'gimnasio', ja: 'ジム' } },
  { id: 'c-teacher', label: { en: 'teacher', es: 'profesor', ja: '先生' } },
  { id: 'c-exam', label: { en: 'exam', es: 'examen', ja: '試験' } },
  { id: 'c-judge', label: { en: 'judge', es: 'juez', ja: '裁判官' } },
  { id: 'c-invoice', label: { en: 'invoice', es: 'factura', ja: '請求書' } },
  { id: 'c-guitar', label: { en: 'guitar', es: 'guitarra', ja: 'ギター' } },
  { id: 'c-ocean', label: { en: 'ocean', es: 'océano', ja: '海' } },
  { id: 'c-spaceship', label: { en: 'spaceship', es: 'nave espacial', ja: '宇宙船' } },
  { id: 'c-robot', label: { en: 'robot', es: 'robot', ja: 'ロボット' } },
  { id: 'c-paella', label: { en: 'paella', es: 'paella', ja: 'パエリア' } },
  { id: 'c-recipe', label: { en: 'recipe', es: 'receta', ja: 'レシピ' } },
];

/** Text the visitor re-chunks in the Chunking Lab. Plain prose, one fact per sentence. */
export const chunkingText: L10n = {
  en: 'The lighthouse on Cape Verin was built in 1887 after three ships were lost on the reef in a single winter. Its first keeper, Marta Oyarzun, lived there for twenty-two years and kept a daily log of the weather. The lamp originally burned whale oil, which had to be carried up 164 steps every evening. In 1923 the tower was connected to the electrical grid and the oil store was turned into a small library. The library still holds the original logbooks, although the oldest volume was damaged by a flood in 1951. Today the lighthouse is automated and nobody lives in it. Volunteers open it to visitors on the first Sunday of each month, and the entrance fee pays for repainting the tower every five years.',
  es: 'El faro del cabo Verín se construyó en 1887 después de que tres barcos se perdieran en el arrecife en un solo invierno. Su primera farera, Marta Oyarzun, vivió allí veintidós años y llevó un registro diario del tiempo. La lámpara quemaba al principio aceite de ballena, que había que subir cada tarde por 164 escalones. En 1923 la torre se conectó a la red eléctrica y el almacén de aceite se convirtió en una pequeña biblioteca. La biblioteca conserva todavía los cuadernos originales, aunque el volumen más antiguo quedó dañado por una inundación en 1951. Hoy el faro está automatizado y nadie vive en él. Unos voluntarios lo abren al público el primer domingo de cada mes, y la entrada paga el repintado de la torre cada cinco años.',
  ja: 'ヴェリン岬の灯台は、ある冬のうちに3隻の船が暗礁で失われたことを受けて、1887年に建てられました。最初の灯台守のMarta Oyarzunは、そこに22年間住み、毎日の天気記録をつけていました。ランプは当初、鯨油を燃やしており、毎晩164段の階段を運び上げる必要がありました。1923年に塔は電力網につながり、油の保管庫は小さな図書館に改装されました。図書館には今も当時の記録簿が残っていますが、いちばん古い1冊は1951年の洪水で傷みました。現在、灯台は自動化されており、誰も住んでいません。ボランティアが毎月第1日曜日に一般公開しており、入場料は5年ごとの塔の塗り直しに充てられます。',
};

export const chunkingQuestions: ChunkingQuestion[] = [
  {
    id: 'cq-keeper',
    question: {
      en: 'Who was the first keeper and how long did she stay?',
      es: '¿Quién fue la primera farera y cuánto tiempo estuvo?',
      ja: '最初の灯台守は誰で、どのくらいの期間そこにいましたか?',
    },
    answer: {
      en: 'Marta Oyarzun, lived there for twenty-two years',
      es: 'Marta Oyarzun, vivió allí veintidós años',
      ja: 'Marta Oyarzunは、そこに22年間住み',
    },
  },
  {
    id: 'cq-library',
    question: {
      en: 'What happened to the oil store when electricity arrived?',
      es: '¿Qué pasó con el almacén de aceite cuando llegó la electricidad?',
      ja: '電気が通ったとき、油の保管庫はどうなりましたか?',
    },
    answer: {
      en: 'the oil store was turned into a small library',
      es: 'el almacén de aceite se convirtió en una pequeña biblioteca',
      ja: '油の保管庫は小さな図書館に改装されました',
    },
  },
  {
    id: 'cq-visit',
    question: {
      en: 'When can I visit the lighthouse?',
      es: '¿Cuándo puedo visitar el faro?',
      ja: '灯台にはいつ訪れられますか?',
    },
    answer: {
      en: 'on the first Sunday of each month',
      es: 'el primer domingo de cada mes',
      ja: '毎月第1日曜日に',
    },
  },
];

export const CHUNK_SIZES = [100, 200, 400] as const;
/** Japanese says the same in far fewer characters, so its chunks are shorter. */
const CHUNK_SCALE: Record<Lang, number> = { en: 1, es: 1, ja: 0.4 };

/** Real length in characters of a chunk size, for the lab text of a language. */
export function chunkChars(lang: Lang, size: number): number {
  return Math.round(size * CHUNK_SCALE[lang]);
}
export const CHUNK_OVERLAPS = [0, 0.3] as const;
