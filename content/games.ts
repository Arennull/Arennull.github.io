import type { ChunkingQuestion, Concept, L10n } from '../src/lib/types';

/** Terms for the "closer or farther" game. A mix of AI and everyday words on purpose. */
export const concepts: Concept[] = [
  { id: 'c-vector-db', label: { en: 'vector database', es: 'base de datos vectorial' } },
  { id: 'c-search', label: { en: 'search engine', es: 'buscador' } },
  { id: 'c-library', label: { en: 'library', es: 'biblioteca' } },
  { id: 'c-memory', label: { en: 'memory', es: 'memoria' } },
  { id: 'c-brain', label: { en: 'brain', es: 'cerebro' } },
  { id: 'c-neuron', label: { en: 'neuron', es: 'neurona' } },
  { id: 'c-hallucination', label: { en: 'hallucination', es: 'alucinación' } },
  { id: 'c-lie', label: { en: 'lie', es: 'mentira' } },
  { id: 'c-dream', label: { en: 'dream', es: 'sueño' } },
  { id: 'c-translation', label: { en: 'translation', es: 'traducción' } },
  { id: 'c-dictionary', label: { en: 'dictionary', es: 'diccionario' } },
  { id: 'c-map', label: { en: 'map', es: 'mapa' } },
  { id: 'c-compass', label: { en: 'compass', es: 'brújula' } },
  { id: 'c-distance', label: { en: 'distance', es: 'distancia' } },
  { id: 'c-sneaker', label: { en: 'sneaker', es: 'zapatilla' } },
  { id: 'c-boot', label: { en: 'boot', es: 'bota' } },
  { id: 'c-coach', label: { en: 'fitness coach', es: 'entrenador personal' } },
  { id: 'c-gym', label: { en: 'gym', es: 'gimnasio' } },
  { id: 'c-teacher', label: { en: 'teacher', es: 'profesor' } },
  { id: 'c-exam', label: { en: 'exam', es: 'examen' } },
  { id: 'c-judge', label: { en: 'judge', es: 'juez' } },
  { id: 'c-invoice', label: { en: 'invoice', es: 'factura' } },
  { id: 'c-guitar', label: { en: 'guitar', es: 'guitarra' } },
  { id: 'c-ocean', label: { en: 'ocean', es: 'océano' } },
  { id: 'c-spaceship', label: { en: 'spaceship', es: 'nave espacial' } },
  { id: 'c-robot', label: { en: 'robot', es: 'robot' } },
  { id: 'c-paella', label: { en: 'paella', es: 'paella' } },
  { id: 'c-recipe', label: { en: 'recipe', es: 'receta' } },
];

/** Text the visitor re-chunks in the Chunking Lab. Plain prose, one fact per sentence. */
export const chunkingText: L10n = {
  en: 'The lighthouse on Cape Verin was built in 1887 after three ships were lost on the reef in a single winter. Its first keeper, Marta Oyarzun, lived there for twenty-two years and kept a daily log of the weather. The lamp originally burned whale oil, which had to be carried up 164 steps every evening. In 1923 the tower was connected to the electrical grid and the oil store was turned into a small library. The library still holds the original logbooks, although the oldest volume was damaged by a flood in 1951. Today the lighthouse is automated and nobody lives in it. Volunteers open it to visitors on the first Sunday of each month, and the entrance fee pays for repainting the tower every five years.',
  es: 'El faro del cabo Verín se construyó en 1887 después de que tres barcos se perdieran en el arrecife en un solo invierno. Su primera farera, Marta Oyarzun, vivió allí veintidós años y llevó un registro diario del tiempo. La lámpara quemaba al principio aceite de ballena, que había que subir cada tarde por 164 escalones. En 1923 la torre se conectó a la red eléctrica y el almacén de aceite se convirtió en una pequeña biblioteca. La biblioteca conserva todavía los cuadernos originales, aunque el volumen más antiguo quedó dañado por una inundación en 1951. Hoy el faro está automatizado y nadie vive en él. Unos voluntarios lo abren al público el primer domingo de cada mes, y la entrada paga el repintado de la torre cada cinco años.',
};

export const chunkingQuestions: ChunkingQuestion[] = [
  {
    id: 'cq-keeper',
    question: {
      en: 'Who was the first keeper and how long did she stay?',
      es: '¿Quién fue la primera farera y cuánto tiempo estuvo?',
    },
    answer: {
      en: 'Marta Oyarzun, lived there for twenty-two years',
      es: 'Marta Oyarzun, vivió allí veintidós años',
    },
  },
  {
    id: 'cq-library',
    question: {
      en: 'What happened to the oil store when electricity arrived?',
      es: '¿Qué pasó con el almacén de aceite cuando llegó la electricidad?',
    },
    answer: {
      en: 'the oil store was turned into a small library',
      es: 'el almacén de aceite se convirtió en una pequeña biblioteca',
    },
  },
  {
    id: 'cq-visit',
    question: {
      en: 'When can I visit the lighthouse?',
      es: '¿Cuándo puedo visitar el faro?',
    },
    answer: {
      en: 'on the first Sunday of each month',
      es: 'el primer domingo de cada mes',
    },
  },
];

export const CHUNK_SIZES = [100, 200, 400] as const;
export const CHUNK_OVERLAPS = [0, 0.3] as const;
