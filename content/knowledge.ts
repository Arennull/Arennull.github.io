import type { KnowledgeNode } from '../src/lib/types';

/**
 * Every entry is one neuron of the brain. `npm run build:brain` embeds them,
 * so editing a text here means regenerating src/data/brain.json.
 */
export const knowledge: KnowledgeNode[] = [
  // ───────────── RAG ─────────────
  {
    id: 'rag-what',
    cluster: 'rag',
    title: { en: 'What RAG is for', es: 'Para qué sirve RAG' },
    text: {
      en: 'Retrieval-augmented generation lets a language model answer from your own documents instead of from memory: first retrieve the relevant fragments, then generate an answer that cites them.',
      es: 'La generación aumentada por recuperación permite que un modelo de lenguaje responda con tus propios documentos y no de memoria: primero se recuperan los fragmentos relevantes y después se genera una respuesta que los cita.',
    },
  },
  {
    id: 'rag-hybrid',
    cluster: 'rag',
    title: { en: 'Hybrid retrieval', es: 'Recuperación híbrida' },
    text: {
      en: 'Vector search understands meaning but misses exact names and codes; keyword search does the opposite. Running both and merging the results beats either one alone.',
      es: 'La búsqueda vectorial entiende el significado pero falla con nombres y códigos exactos; la búsqueda por palabras clave hace lo contrario. Lanzar las dos y fusionar los resultados supera a cualquiera por separado.',
    },
  },
  {
    id: 'rag-rrf',
    cluster: 'rag',
    title: { en: 'Reciprocal rank fusion', es: 'Fusión por rango recíproco' },
    text: {
      en: 'Reciprocal rank fusion is how I merge keyword search and vector search: it combines the two result lists using only the position of each document, not its score. Scores from a vector index and a lexical index are not comparable, ranks are.',
      es: 'La fusión por rango recíproco es como fusiono la búsqueda por palabras clave y la vectorial: combina las dos listas de resultados usando solo la posición de cada documento, no su puntuación. Las puntuaciones de un índice vectorial y uno léxico no son comparables; las posiciones sí.',
    },
  },
  {
    id: 'rag-chunking',
    cluster: 'rag',
    title: { en: 'Chunking', es: 'Troceado (chunking)' },
    text: {
      en: 'Documents are split into chunks before indexing. Chunks that are too small lose context, chunks that are too large dilute the signal, and a little overlap keeps sentences from being cut in half.',
      es: 'Los documentos se dividen en trozos antes de indexarlos. Si son muy pequeños pierden contexto, si son muy grandes diluyen la señal, y un poco de solape evita que una frase quede partida en dos.',
    },
  },
  {
    id: 'rag-rerank',
    cluster: 'rag',
    title: { en: 'Reranking is a trade-off', es: 'El rerank es un compromiso' },
    text: {
      en: 'A reranker re-scores the retrieved candidates with a slower, more precise model. It often helps, but it costs latency and money, so it has to earn its place in an evaluation before it ships.',
      es: 'Un reranker vuelve a puntuar los candidatos recuperados con un modelo más lento y preciso. Suele ayudar, pero cuesta latencia y dinero, así que tiene que ganarse el sitio en una evaluación antes de salir a producción.',
    },
  },
  {
    id: 'rag-grounding',
    cluster: 'rag',
    title: { en: 'Grounding and citations', es: 'Fundamentación y citas' },
    text: {
      en: 'A grounded answer makes no unsupported claims: the model only states what the retrieved sources support, and points to them. If the sources do not contain the answer, the right output is to say so, not to improvise.',
      es: 'Una respuesta fundamentada no hace afirmaciones sin respaldo: el modelo solo afirma lo que respaldan las fuentes recuperadas, y las señala. Si las fuentes no contienen la respuesta, lo correcto es decirlo, no improvisar.',
    },
  },
  {
    id: 'rag-ingestion',
    cluster: 'rag',
    title: { en: 'Incremental ingestion', es: 'Ingesta incremental' },
    text: {
      en: 'An ingestion pipeline should hash each chunk and re-embed only what changed. Queues and scheduled jobs keep the index fresh without paying to embed the whole corpus again.',
      es: 'Un pipeline de ingesta debe calcular el hash de cada trozo y volver a vectorizar solo lo que cambió. Colas y tareas programadas mantienen el índice al día sin pagar por vectorizar todo el corpus otra vez.',
    },
  },

  // ───────────── Embeddings ─────────────
  {
    id: 'emb-what',
    cluster: 'embeddings',
    title: { en: 'What an embedding is', es: 'Qué es un embedding' },
    text: {
      en: 'An embedding turns a piece of text into a list of numbers, a vector, so that texts with similar meaning land close together in space even when they share no words.',
      es: 'Un embedding convierte un texto en una lista de números, un vector, de forma que los textos con significado parecido quedan cerca en el espacio aunque no compartan ninguna palabra.',
    },
  },
  {
    id: 'emb-cosine',
    cluster: 'embeddings',
    title: { en: 'Cosine similarity', es: 'Similitud coseno' },
    text: {
      en: 'To compare two vectors you use cosine similarity, which measures the angle between them: 1 means same direction, 0 means unrelated. It is the usual way to compare embeddings because it ignores vector length.',
      es: 'Para comparar dos vectores se usa la similitud coseno, que mide el ángulo entre ellos: 1 es la misma dirección y 0 es que no tienen relación. Es la forma habitual de comparar embeddings porque ignora la longitud del vector.',
    },
  },
  {
    id: 'emb-ann',
    cluster: 'embeddings',
    title: { en: 'Vector indexes (HNSW)', es: 'Índices vectoriales (HNSW)' },
    text: {
      en: 'Comparing a query against every stored vector does not scale. Approximate nearest-neighbour indexes such as HNSW build a navigable graph and find close vectors in milliseconds.',
      es: 'Comparar una consulta con todos los vectores guardados no escala. Los índices de vecinos aproximados como HNSW construyen un grafo navegable y encuentran vectores cercanos en milisegundos.',
    },
  },
  {
    id: 'emb-pgvector',
    cluster: 'embeddings',
    title: { en: 'pgvector', es: 'pgvector' },
    text: {
      en: 'pgvector stores embeddings inside PostgreSQL, next to the rest of the data. Vectors live under the same permissions, transactions and migrations as everything else, with no separate vector database to operate.',
      es: 'pgvector guarda los embeddings dentro de PostgreSQL, junto al resto de los datos. Los vectores viven bajo los mismos permisos, transacciones y migraciones que todo lo demás, sin otra base de datos vectorial que mantener.',
    },
  },
  {
    id: 'emb-multilingual',
    cluster: 'embeddings',
    title: { en: 'Multilingual embeddings', es: 'Embeddings multilingües' },
    text: {
      en: 'A multilingual embedding model places a sentence and its translation at almost the same point, so a question in Spanish can retrieve a document written in English. This site uses one.',
      es: 'Un modelo de embeddings multilingüe coloca una frase y su traducción casi en el mismo punto, así que una pregunta en español puede recuperar un documento escrito en inglés. Esta web usa uno.',
    },
  },
  {
    id: 'emb-quantization',
    cluster: 'embeddings',
    title: { en: 'Quantization', es: 'Cuantización' },
    text: {
      en: 'Quantization stores each vector dimension in one byte instead of four. The ranking barely changes and memory drops by 75%. The vectors behind this brain are quantized to 8 bits.',
      es: 'La cuantización guarda cada dimensión del vector en un byte en lugar de cuatro. El ranking apenas cambia y la memoria baja un 75 %. Los vectores de este cerebro están cuantizados a 8 bits.',
    },
  },
  {
    id: 'emb-model-drift',
    cluster: 'embeddings',
    title: { en: 'Never mix embedding models', es: 'Nunca mezcles modelos de embeddings' },
    text: {
      en: 'Vectors from two different embedding models live in different spaces and cannot be compared. A system should check at startup that the stored vectors and the query model match.',
      es: 'Los vectores de dos modelos de embeddings distintos viven en espacios distintos y no se pueden comparar. Un sistema debe comprobar al arrancar que los vectores guardados y el modelo de consulta coinciden.',
    },
  },
  {
    id: 'emb-projection',
    cluster: 'embeddings',
    title: { en: 'Seeing 384 dimensions in 3D', es: 'Ver 384 dimensiones en 3D' },
    text: {
      en: 'Each neuron here has 384 dimensions. UMAP squeezes them into three so they can be drawn, keeping neighbours together. The picture is a map; the real distances are computed in the full space.',
      es: 'Cada neurona tiene aquí 384 dimensiones. UMAP las comprime a tres para poder dibujarlas, manteniendo juntos a los vecinos. El dibujo es un mapa; las distancias reales se calculan en el espacio completo.',
    },
  },

  // ───────────── AI brains: memory, agents, guardrails ─────────────
  {
    id: 'brain-what',
    cluster: 'brains',
    title: { en: 'What I call an AI brain', es: 'A qué llamo un cerebro de IA' },
    text: {
      en: 'An AI brain is the knowledge layer around a model: what it knows about the business, what it remembers about each person, the rules it must follow and the tools it can use.',
      es: 'Un cerebro de IA es la capa de conocimiento que rodea al modelo: lo que sabe del negocio, lo que recuerda de cada persona, las reglas que debe cumplir y las herramientas que puede usar.',
    },
  },
  {
    id: 'brain-memory',
    cluster: 'brains',
    title: { en: 'Long-term memory', es: 'Memoria a largo plazo' },
    text: {
      en: 'For an assistant to remember each client across conversations, memory works by extracting durable facts about the person from each chat, removing duplicates, and bringing back only the relevant ones in later conversations.',
      es: 'Para que un asistente recuerde a cada cliente entre conversaciones, la memoria funciona extrayendo de cada chat los hechos duraderos sobre la persona, eliminando duplicados y recuperando solo los relevantes en conversaciones posteriores.',
    },
  },
  {
    id: 'brain-persona',
    cluster: 'brains',
    title: { en: 'Persona and voice', es: 'Personalidad y voz' },
    text: {
      en: 'Making an assistant sound like a specific person takes more than a prompt: real examples of how they write, response rules enforced in code, and blind tests against the real person.',
      es: 'Conseguir que un asistente suene como una persona concreta requiere más que un prompt: ejemplos reales de cómo escribe, reglas de respuesta aplicadas en código y pruebas a ciegas contra la persona real.',
    },
  },
  {
    id: 'brain-guardrails',
    cluster: 'brains',
    title: { en: 'Guardrails outside the model', es: 'Barreras fuera del modelo' },
    text: {
      en: 'To stop a model from making unsupported claims, the checks that matter run in ordinary code, not in the prompt: filters on what goes in and what comes out, and gates that block a claim unless the retrieved evidence supports it.',
      es: 'Para evitar que un modelo haga afirmaciones sin respaldo, las comprobaciones importantes se ejecutan en código normal, no en el prompt: filtros sobre lo que entra y lo que sale, y puertas que bloquean una afirmación si la evidencia recuperada no la respalda.',
    },
  },
  {
    id: 'brain-agents',
    cluster: 'brains',
    title: { en: 'Agents and tools', es: 'Agentes y herramientas' },
    text: {
      en: 'An agent is a model that decides which tool to call next. I keep each tool small and typed, route by intent before generating, and give the model only the context that the step needs.',
      es: 'Un agente es un modelo que decide qué herramienta llamar a continuación. Mantengo cada herramienta pequeña y tipada, enruto por intención antes de generar y doy al modelo solo el contexto que ese paso necesita.',
    },
  },
  {
    id: 'brain-correction',
    cluster: 'brains',
    title: {
      en: 'A knowledge base people can correct',
      es: 'Una base de conocimiento que se puede corregir',
    },
    text: {
      en: 'Knowledge goes stale. Editors should be able to fix what the assistant knows by talking to it, with every change audited and reversible, instead of opening a ticket for an engineer.',
      es: 'El conocimiento caduca. Los editores deben poder corregir lo que sabe el asistente hablando con él, con cada cambio auditado y reversible, en lugar de abrir un ticket a un ingeniero.',
    },
  },
  {
    id: 'brain-structured',
    cluster: 'brains',
    title: { en: 'Structured outputs', es: 'Salidas estructuradas' },
    text: {
      en: 'When the output of a model feeds another program, it should follow a schema. Structured outputs validated at the boundary turn a paragraph of prose into data the rest of the system can trust.',
      es: 'Cuando la salida de un modelo alimenta a otro programa, debe seguir un esquema. Las salidas estructuradas validadas en el borde convierten un párrafo de prosa en datos en los que el resto del sistema puede confiar.',
    },
  },

  // ───────────── Evaluation ─────────────
  {
    id: 'eval-why',
    cluster: 'eval',
    title: { en: 'Evaluate before you tune', es: 'Evalúa antes de ajustar' },
    text: {
      en: 'Without a test set you cannot evaluate retrieval, and every change to a RAG system is a guess. I build a set of real questions with expected sources first, and only then compare chunking, fusion or reranking options.',
      es: 'Sin un conjunto de pruebas no se puede evaluar la recuperación, y cada cambio en un sistema RAG es una apuesta. Primero construyo un conjunto de preguntas reales con sus fuentes esperadas, y solo entonces comparo opciones de troceado, fusión o rerank.',
    },
  },
  {
    id: 'eval-metrics',
    cluster: 'eval',
    title: { en: 'Recall@k and MRR', es: 'Recall@k y MRR' },
    text: {
      en: 'These are the two metrics I use to evaluate retrieval quality. Recall@k asks whether the right document appears in the top k results. MRR rewards putting it near the top. Together they tell you if retrieval finds the answer and how high it ranks it.',
      es: 'Son las dos métricas que uso para evaluar la calidad de la recuperación. Recall@k pregunta si el documento correcto aparece entre los k primeros resultados. MRR premia ponerlo cerca del primero. Juntas dicen si la recuperación encuentra la respuesta y en qué posición la deja.',
    },
  },
  {
    id: 'eval-holdout',
    cluster: 'eval',
    title: { en: 'Held-out cases', es: 'Casos de reserva' },
    text: {
      en: 'If you tune on the same questions you report, the numbers lie. Keeping a held-out split that is never used for tuning shows whether an improvement is real or just overfitting.',
      es: 'Si ajustas con las mismas preguntas con las que informas, los números engañan. Guardar una parte de reserva que nunca se usa para ajustar muestra si una mejora es real o solo sobreajuste.',
    },
  },
  {
    id: 'eval-judge',
    cluster: 'eval',
    title: { en: 'Model-as-judge, blind', es: 'Un modelo como juez, a ciegas' },
    text: {
      en: 'For qualities like tone, a second model can act as judge in a blind A/B test: it sees two replies, one human and one generated, without knowing which is which.',
      es: 'Para cualidades como el tono, un segundo modelo puede hacer de juez en una prueba A/B a ciegas: ve dos respuestas, una humana y otra generada, sin saber cuál es cuál.',
    },
  },
  {
    id: 'eval-cost',
    cluster: 'eval',
    title: {
      en: 'Cost and latency are metrics too',
      es: 'El coste y la latencia también son métricas',
    },
    text: {
      en: 'Every model call should record tokens, cost and latency. Quality that arrives five seconds late or costs too much per answer is not a feature users will get to keep.',
      es: 'Cada llamada al modelo debe registrar tokens, coste y latencia. La calidad que llega cinco segundos tarde o cuesta demasiado por respuesta no es una función que los usuarios vayan a conservar.',
    },
  },
  {
    id: 'eval-hallucination',
    cluster: 'eval',
    title: { en: 'Measuring hallucination', es: 'Medir las alucinaciones' },
    text: {
      en: 'Hallucination is measurable: take real answers, check each claim against the data, and count the unsupported ones. That number is what justifies building a claim filter.',
      es: 'La alucinación se puede medir: se toman respuestas reales, se contrasta cada afirmación con los datos y se cuentan las que no tienen respaldo. Ese número es lo que justifica construir un filtro de afirmaciones.',
    },
  },

  // ───────────── Projects ─────────────
  {
    id: 'proj-sangi',
    cluster: 'projects',
    title: {
      en: 'Sangi — RAG chat over a footwear archive',
      es: 'Sangi — chat RAG sobre un archivo de calzado',
    },
    text: {
      en: 'Sangi is a RAG project we built: a chat over a curated archive of designer footwear. It runs on Supabase with pgvector and HNSW indexes, and retrieves with hybrid search: vector plus lexical results merged by reciprocal rank fusion.',
      es: 'Sangi es un proyecto RAG que hemos construido: un chat sobre un archivo curado de calzado de diseñador. Funciona sobre Supabase con pgvector e índices HNSW, y recupera con búsqueda híbrida: resultados vectoriales y léxicos fusionados por rango recíproco.',
    },
  },
  {
    id: 'proj-sangi-eval',
    cluster: 'projects',
    title: { en: 'Sangi — the reranker we rejected', es: 'Sangi — el reranker que descartamos' },
    text: {
      en: 'On Sangi we compared retrieval variants on 103 cases. Rank fusion won with an MRR of 0.73 on the held-out split, and a reranker was rejected because it lowered recall@10 from 0.92 to 0.85 and added about 4.8 seconds.',
      es: 'En Sangi comparamos variantes de recuperación con 103 casos. La fusión por rango ganó con un MRR de 0,73 en la parte de reserva, y se descartó un reranker porque bajaba el recall@10 de 0,92 a 0,85 y añadía unos 4,8 segundos.',
    },
  },
  {
    id: 'proj-sangi-gate',
    cluster: 'projects',
    title: { en: 'Sangi — the claim gate', es: 'Sangi — la puerta de afirmaciones' },
    text: {
      en: 'An audit of real Sangi chat answers found unsupported claims in 26 of 36. The fix was a deterministic claim gate and evidence gate that run outside the model and block what the data does not back.',
      es: 'Una auditoría de respuestas reales del chat de Sangi encontró afirmaciones sin respaldo en 26 de 36. La solución fue una puerta de afirmaciones y otra de evidencia, deterministas, que se ejecutan fuera del modelo y bloquean lo que los datos no respaldan.',
    },
  },
  {
    id: 'proj-jairo',
    cluster: 'projects',
    title: {
      en: 'JairoFitness — a RAG project: an AI coach with a real voice',
      es: 'JairoFitness — proyecto RAG: un coach de IA con voz real',
    },
    text: {
      en: 'JairoFitness is a RAG project we built for online fitness coaching: an AI assistant that, in text and voice, answers with the personality of the real coach. It combines a pgvector knowledge base, reviewed coaching cases and long-term memory of each client.',
      es: 'JairoFitness es un proyecto RAG que hemos construido para coaching de fitness online: un asistente de IA que, por texto y voz, responde con la personalidad del coach real. Combina una base de conocimiento en pgvector, casos de coaching revisados y memoria a largo plazo de cada cliente.',
    },
  },
  {
    id: 'proj-jairo-eval',
    cluster: 'projects',
    title: {
      en: 'JairoFitness — tested against the human',
      es: 'JairoFitness — probado contra el humano',
    },
    text: {
      en: 'In blind A/B tests on JairoFitness, the judge mistook the AI for the real coach about 31% of the time. An output filter that stops internal notes reaching clients had zero false positives over 5,041 real sentences, at about 1.7 s p95 latency.',
      es: 'En pruebas A/B a ciegas en JairoFitness, el juez confundió a la IA con el coach real cerca del 31 % de las veces. Un filtro de salida que impide que las notas internas lleguen al cliente dio cero falsos positivos sobre 5.041 frases reales, con una latencia p95 de unos 1,7 s.',
    },
  },
  {
    id: 'proj-market',
    cluster: 'projects',
    title: { en: 'Market Movers — AI inside a CRM', es: 'Market Movers — IA dentro de un CRM' },
    text: {
      en: 'Market Movers is a B2B CRM with AI features: meeting briefs where every statement cites its source, cached by a hash of the deal context, plus proposal drafting, business-card extraction and voice notes, all with token and cost telemetry.',
      es: 'Market Movers es un CRM B2B con funciones de IA: briefs de reunión donde cada afirmación cita su fuente, cacheados por un hash del contexto del negocio, además de redacción de propuestas, lectura de tarjetas de visita y notas de voz, todo con telemetría de tokens y coste.',
    },
  },
  {
    id: 'proj-platforms',
    cluster: 'projects',
    title: { en: 'Full-stack platforms', es: 'Plataformas full stack' },
    text: {
      en: 'Beyond AI, I work on full-stack products: Proyectasport, a school sports platform with role-based permissions and signed links for families; Catalyst, an HR tool with optimistic concurrency; and an investment ERP for Private Equity Club.',
      es: 'Más allá de la IA, trabajo en productos full stack: Proyectasport, una plataforma de deporte escolar con permisos por rol y enlaces firmados para las familias; Catalyst, una herramienta de RR. HH. con concurrencia optimista; y un ERP de inversión para Private Equity Club.',
    },
  },

  // ───────────── About ─────────────
  {
    id: 'about-me',
    cluster: 'about',
    title: { en: 'Who I am', es: 'Quién soy' },
    text: {
      en: 'I am Alejandro Tiscar, an AI engineer. I build retrieval systems, assistants with memory and the evaluation that keeps them honest, working with the team at The AI Business.',
      es: 'Soy Alejandro Tiscar, ingeniero de IA. Construyo sistemas de recuperación, asistentes con memoria y la evaluación que los mantiene honestos, trabajando con el equipo de The AI Business.',
    },
  },
  {
    id: 'about-stack',
    cluster: 'about',
    title: { en: 'My stack', es: 'Mi stack' },
    text: {
      en: 'My daily tools are TypeScript, Python, React and Next.js on the front, Node with Express or NestJS on the back, PostgreSQL with Prisma and Supabase, and deployments on Railway.',
      es: 'Mis herramientas diarias son TypeScript, Python, React y Next.js en el front, Node con Express o NestJS en el back, PostgreSQL con Prisma y Supabase, y despliegues en Railway.',
    },
  },
  {
    id: 'about-passion',
    cluster: 'about',
    title: { en: 'Why AI brains', es: 'Por qué los cerebros de IA' },
    text: {
      en: 'What fascinates me is that meaning can be turned into geometry. I love science fiction and algorithms that feel taken from it, and a knowledge base you can talk to is the closest thing I have built to one.',
      es: 'Lo que me fascina es que el significado se pueda convertir en geometría. Me encantan la ciencia ficción y los algoritmos que parecen sacados de ella, y una base de conocimiento con la que se puede hablar es lo más parecido que he construido.',
    },
  },
  {
    id: 'about-how',
    cluster: 'about',
    title: { en: 'How I work', es: 'Cómo trabajo' },
    text: {
      en: 'I ship in small steps with tests, typed contracts and continuous integration. I would rather show a number from an evaluation than an opinion, and I write down why a decision was taken.',
      es: 'Entrego en pasos pequeños con tests, contratos tipados e integración continua. Prefiero enseñar un número de una evaluación que una opinión, y dejo por escrito por qué se tomó cada decisión.',
    },
  },
  {
    id: 'about-site',
    cluster: 'about',
    title: { en: 'How this site works', es: 'Cómo funciona esta web' },
    text: {
      en: 'This portfolio is a static site. A build script embeds every fragment with a multilingual model and saves the vectors; the search, the ranking and the games you play here run on those real vectors in your browser.',
      es: 'Este portfolio es una web estática. Un script de compilación vectoriza cada fragmento con un modelo multilingüe y guarda los vectores; la búsqueda, el ranking y los juegos que ves aquí funcionan sobre esos vectores reales en tu navegador.',
    },
  },
  {
    id: 'about-contact',
    cluster: 'about',
    title: { en: 'Looking for', es: 'Qué busco' },
    text: {
      en: 'I am looking for a role as an AI engineer where retrieval, knowledge bases and assistants are the product, not a side feature. You can reach me by email or on GitHub.',
      es: 'Busco un puesto de ingeniero de IA donde la recuperación, las bases de conocimiento y los asistentes sean el producto y no un añadido. Puedes escribirme por email o en GitHub.',
    },
  },
];
