import type { Cluster, Lang } from '../lib/types';

const en = {
  nav: {
    brain: 'Brain',
    lab: 'Lab',
    projects: 'Projects',
    approach: 'Approach',
    contact: 'Contact',
  },
  quick: 'Quick view',
  hero: {
    role: 'AI Engineer',
    title: 'I build AI brains you can question.',
    lead: 'Retrieval systems, assistants with memory and the evaluation that keeps them honest. The brain on this page is real: each neuron is a fragment of what I know, placed by its embedding.',
    ask: 'Ask my brain',
    projects: 'See projects',
    stats: (neurons: number, dims: number) =>
      `${neurons} neurons · ${dims} dimensions · runs in your browser`,
    hint: 'Drag to rotate · click a neuron',
    legend: 'Light up a region',
  },
  clusters: {
    rag: 'RAG',
    embeddings: 'Embeddings',
    brains: 'AI brains',
    eval: 'Evaluation',
    projects: 'Projects',
    about: 'About me',
  } satisfies Record<Cluster, string>,
  neuron: { neighbours: 'Nearest neurons', close: 'Close', cosine: 'cosine' },
  ask: {
    kicker: 'Ask my brain',
    title: 'Watch a retrieval pipeline answer about me',
    lead: 'Pick a question. Nothing is scripted except the wording of the answer: the search, the scores and the fusion are computed live on the vectors.',
    retrieval: 'Retrieval',
    on: 'on',
    off: 'off',
    steps: ['Embed', 'Search', 'Fuse', 'Answer'],
    embedNote: (dims: number) => `The question becomes a ${dims}-dimension vector. First 64 shown.`,
    vector: 'Vector search',
    lexical: 'Keyword search',
    fused: 'Rank fusion',
    fusedNote: 'Merged by position, not by score. Agreement between both lists wins.',
    answer: 'Grounded answer',
    sources: 'Sources',
    ungrounded: 'Ungrounded answer',
    ungroundedNote:
      'No retrieval, no sources. Fluent, confident and wrong — this is what a model does from memory.',
    none: 'no keyword match',
    replay: 'Replay',
    pick: 'Pick a question to wake the brain up.',
  },
  lab: {
    kicker: 'Lab',
    title: 'Three games on real vectors',
    lead: 'Each one teaches a decision I make when building a retrieval system.',
    tabs: ['Be the retriever', 'Chunking lab', 'Closer or farther'],
    learned: 'What you just saw',
  },
  retriever: {
    intro: 'Pick the 3 fragments you think vector search ranks highest for this question.',
    round: (n: number, total: number) => `Round ${n} of ${total}`,
    check: 'Check',
    picked: (n: number) => `${n} of 3 picked`,
    next: 'Next question',
    again: 'Play again',
    score: (hits: number) => `You matched ${hits} of the real top 3`,
    total: (hits: number, max: number) => `Final score: ${hits} / ${max}`,
    yours: 'your pick',
    lesson:
      'Vector search ranks by meaning, not by shared words. When your intuition and the ranking disagree, that gap is exactly what an evaluation set measures.',
  },
  chunking: {
    intro: 'Change how the text is cut and see whether the question still finds its answer.',
    size: 'Chunk size',
    chars: 'chars',
    overlap: 'Overlap',
    question: 'Question',
    chunks: (n: number) => `${n} chunks`,
    top: 'retrieved',
    hasAnswer: 'holds the full answer',
    verdictOk: 'The top chunk holds the whole answer.',
    verdictLow: (rank: number) => `The answer is whole, but its chunk only ranks #${rank}.`,
    verdictSplit: 'The answer was cut in two. No chunk holds it whole.',
    context: (chars: number) => `Top 3 chunks send ${chars} characters to the model.`,
    lesson:
      'Small chunks rank sharply but cut answers in half; large chunks keep answers whole but send more noise. Overlap is the cheap fix for the cuts. There is no universal setting, only the one your evaluation picks.',
  },
  closer: {
    intro: 'Which of the two is closer to the word above, according to the embedding model?',
    streak: 'Streak',
    best: 'Best',
    right: 'Right.',
    wrong: 'Not this time.',
    next: 'Next',
    lesson:
      'The model has never seen a definition. It learned these distances from how words are used, in Spanish and English at once.',
  },
  projects: {
    kicker: 'Projects',
    title: 'Systems in production',
    lead: 'Built with the team at The AI Business. Numbers come from the evaluations in each repository.',
    visit: 'Visit',
    inBrain: 'Show in brain',
    more: 'More engineering work',
  },
  approach: {
    kicker: 'Approach',
    title: 'How I build a retrieval system',
    steps: [
      {
        name: 'Ingest',
        text: 'Hash every chunk and embed only what changed. Queues keep the index fresh.',
      },
      {
        name: 'Chunk',
        text: 'Cut by structure first, size second. Measure before settling on a number.',
      },
      {
        name: 'Retrieve',
        text: 'Vector and keyword search together, merged by rank. One covers the other’s blind spot.',
      },
      {
        name: 'Guard',
        text: 'Checks that matter live in code: evidence gates, output filters, typed outputs.',
      },
      {
        name: 'Evaluate',
        text: 'A test set with held-out cases decides. Recall, MRR, cost and latency, not opinions.',
      },
    ],
  },
  contact: {
    kicker: 'Contact',
    title: 'Looking for a team where the knowledge layer is the product.',
    lead: 'AI engineer roles around retrieval, knowledge bases and assistants.',
    email: 'Email me',
    github: 'GitHub',
    footer: 'Static site. Three.js, a multilingual embedding model at build time, and no backend.',
    source: 'Source code',
  },
  quickView: {
    title: 'Alejandro Tiscar — AI Engineer',
    bullets: [
      'Builds RAG systems in production: hybrid retrieval on pgvector, rank fusion, incremental ingestion.',
      'Builds assistants with long-term memory, persona and guardrails that run outside the model.',
      'Decides with evaluation: test sets with held-out cases, recall@k, MRR, cost and latency.',
    ],
    projects: 'Projects',
    stack: 'Stack',
    stackList:
      'TypeScript · Python · React · Next.js · Node (Express, NestJS) · PostgreSQL · pgvector · Prisma · Supabase · Railway',
    close: 'Close',
  },
  fallback: 'Your browser cannot draw the 3D brain, so here is its map in 2D.',
};

export type Strings = typeof en;

const es: Strings = {
  nav: {
    brain: 'Cerebro',
    lab: 'Lab',
    projects: 'Proyectos',
    approach: 'Método',
    contact: 'Contacto',
  },
  quick: 'Vista rápida',
  hero: {
    role: 'AI Engineer',
    title: 'Construyo cerebros de IA a los que se les puede preguntar.',
    lead: 'Sistemas de recuperación, asistentes con memoria y la evaluación que los mantiene honestos. El cerebro de esta página es real: cada neurona es un fragmento de lo que sé, colocado según su embedding.',
    ask: 'Pregúntale a mi cerebro',
    projects: 'Ver proyectos',
    stats: (neurons, dims) =>
      `${neurons} neuronas · ${dims} dimensiones · se ejecuta en tu navegador`,
    hint: 'Arrastra para girar · haz clic en una neurona',
    legend: 'Ilumina una región',
  },
  clusters: {
    rag: 'RAG',
    embeddings: 'Embeddings',
    brains: 'Cerebros de IA',
    eval: 'Evaluación',
    projects: 'Proyectos',
    about: 'Sobre mí',
  },
  neuron: { neighbours: 'Neuronas más cercanas', close: 'Cerrar', cosine: 'coseno' },
  ask: {
    kicker: 'Pregúntale a mi cerebro',
    title: 'Mira cómo un pipeline de recuperación responde sobre mí',
    lead: 'Elige una pregunta. Lo único preparado es la redacción de la respuesta: la búsqueda, las puntuaciones y la fusión se calculan en vivo sobre los vectores.',
    retrieval: 'Recuperación',
    on: 'sí',
    off: 'no',
    steps: ['Vectorizar', 'Buscar', 'Fusionar', 'Responder'],
    embedNote: (dims) =>
      `La pregunta se convierte en un vector de ${dims} dimensiones. Se muestran las 64 primeras.`,
    vector: 'Búsqueda vectorial',
    lexical: 'Búsqueda por palabras',
    fused: 'Fusión por rango',
    fusedNote: 'Se fusiona por posición, no por puntuación. Gana lo que ambas listas comparten.',
    answer: 'Respuesta fundamentada',
    sources: 'Fuentes',
    ungrounded: 'Respuesta sin fundamento',
    ungroundedNote:
      'Sin recuperación no hay fuentes. Fluida, segura y falsa: esto es lo que hace un modelo de memoria.',
    none: 'ninguna palabra coincide',
    replay: 'Repetir',
    pick: 'Elige una pregunta para despertar al cerebro.',
  },
  lab: {
    kicker: 'Lab',
    title: 'Tres juegos sobre vectores reales',
    lead: 'Cada uno enseña una decisión que tomo al construir un sistema de recuperación.',
    tabs: ['Sé el retriever', 'Chunking lab', 'Más cerca o más lejos'],
    learned: 'Lo que acabas de ver',
  },
  retriever: {
    intro:
      'Elige los 3 fragmentos que crees que la búsqueda vectorial pone más arriba para esta pregunta.',
    round: (n, total) => `Ronda ${n} de ${total}`,
    check: 'Comprobar',
    picked: (n) => `${n} de 3 elegidos`,
    next: 'Siguiente pregunta',
    again: 'Jugar otra vez',
    score: (hits) => `Has acertado ${hits} del top 3 real`,
    total: (hits, max) => `Puntuación final: ${hits} / ${max}`,
    yours: 'tu elección',
    lesson:
      'La búsqueda vectorial ordena por significado, no por palabras compartidas. Cuando tu intuición y el ranking no coinciden, esa diferencia es justo lo que mide un conjunto de evaluación.',
  },
  chunking: {
    intro: 'Cambia cómo se corta el texto y mira si la pregunta sigue encontrando su respuesta.',
    size: 'Tamaño del trozo',
    chars: 'caracteres',
    overlap: 'Solape',
    question: 'Pregunta',
    chunks: (n) => `${n} trozos`,
    top: 'recuperado',
    hasAnswer: 'contiene la respuesta completa',
    verdictOk: 'El primer trozo contiene la respuesta entera.',
    verdictLow: (rank) => `La respuesta está entera, pero su trozo solo queda el n.º ${rank}.`,
    verdictSplit: 'La respuesta ha quedado partida en dos. Ningún trozo la contiene entera.',
    context: (chars) => `Los 3 primeros trozos envían ${chars} caracteres al modelo.`,
    lesson:
      'Los trozos pequeños puntúan con precisión pero parten las respuestas; los grandes las mantienen enteras pero envían más ruido. El solape es el arreglo barato para los cortes. No hay un ajuste universal, solo el que elige tu evaluación.',
  },
  closer: {
    intro:
      '¿Cuál de las dos está más cerca de la palabra de arriba, según el modelo de embeddings?',
    streak: 'Racha',
    best: 'Mejor',
    right: 'Correcto.',
    wrong: 'Esta vez no.',
    next: 'Siguiente',
    lesson:
      'El modelo nunca ha visto una definición. Aprendió estas distancias de cómo se usan las palabras, en español y en inglés a la vez.',
  },
  projects: {
    kicker: 'Proyectos',
    title: 'Sistemas en producción',
    lead: 'Construidos con el equipo de The AI Business. Las cifras salen de las evaluaciones de cada repositorio.',
    visit: 'Visitar',
    inBrain: 'Ver en el cerebro',
    more: 'Más trabajo de ingeniería',
  },
  approach: {
    kicker: 'Método',
    title: 'Cómo construyo un sistema de recuperación',
    steps: [
      {
        name: 'Ingesta',
        text: 'Hash de cada trozo y vectorizar solo lo que cambió. Las colas mantienen el índice al día.',
      },
      {
        name: 'Troceado',
        text: 'Cortar primero por estructura y después por tamaño. Medir antes de fijar un número.',
      },
      {
        name: 'Recuperación',
        text: 'Búsqueda vectorial y por palabras a la vez, fusionadas por rango. Una cubre el punto ciego de la otra.',
      },
      {
        name: 'Barreras',
        text: 'Las comprobaciones importantes viven en código: puertas de evidencia, filtros de salida, salidas tipadas.',
      },
      {
        name: 'Evaluación',
        text: 'Decide un conjunto de pruebas con casos de reserva. Recall, MRR, coste y latencia, no opiniones.',
      },
    ],
  },
  contact: {
    kicker: 'Contacto',
    title: 'Busco un equipo donde la capa de conocimiento sea el producto.',
    lead: 'Puestos de ingeniería de IA en torno a recuperación, bases de conocimiento y asistentes.',
    email: 'Escríbeme',
    github: 'GitHub',
    footer:
      'Web estática. Three.js, un modelo de embeddings multilingüe en la compilación y ningún backend.',
    source: 'Código fuente',
  },
  quickView: {
    title: 'Alejandro Tiscar — AI Engineer',
    bullets: [
      'Construye sistemas RAG en producción: recuperación híbrida en pgvector, fusión por rango, ingesta incremental.',
      'Construye asistentes con memoria a largo plazo, personalidad y barreras que se ejecutan fuera del modelo.',
      'Decide con evaluación: conjuntos de prueba con casos de reserva, recall@k, MRR, coste y latencia.',
    ],
    projects: 'Proyectos',
    stack: 'Stack',
    stackList:
      'TypeScript · Python · React · Next.js · Node (Express, NestJS) · PostgreSQL · pgvector · Prisma · Supabase · Railway',
    close: 'Cerrar',
  },
  fallback: 'Tu navegador no puede dibujar el cerebro en 3D, así que aquí tienes su mapa en 2D.',
};

export const strings: Record<Lang, Strings> = { en, es };

export const CLUSTER_COLORS: Record<Cluster, string> = {
  rag: '#ffb454',
  embeddings: '#4de2c5',
  brains: '#b08cff',
  eval: '#ff7ab8',
  projects: '#6fb1ff',
  about: '#c6f36b',
};

export const CONTACT = {
  email: 'alejandrotiscarfelix@gmail.com',
  github: 'https://github.com/Arennull',
  repo: 'https://github.com/Arennull/Arennull.github.io',
};
