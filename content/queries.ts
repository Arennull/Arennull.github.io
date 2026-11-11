import type { PreparedQuery } from '../src/lib/types';

export const queries: PreparedQuery[] = [
  {
    id: 'q-built',
    question: {
      en: 'Which RAG projects have you built?',
      es: '¿Qué proyectos RAG has construido?',
    },
    answer: {
      en: 'Two systems in production. Sangi is a RAG chat over an archive of designer footwear, on Supabase with pgvector and hybrid retrieval merged by rank fusion. JairoFitness is an AI coach that answers in the voice of the real coach, backed by a pgvector knowledge base, reviewed coaching cases and long-term memory of each client.',
      es: 'Dos sistemas en producción. Sangi es un chat RAG sobre un archivo de calzado de diseñador, en Supabase con pgvector y recuperación híbrida fusionada por rango. JairoFitness es un coach de IA que responde con la voz del coach real, apoyado en una base de conocimiento en pgvector, casos de coaching revisados y memoria a largo plazo de cada cliente.',
    },
    ungrounded: {
      en: 'Alejandro has extensive experience building cutting-edge RAG solutions for Fortune 500 companies, using LangChain and Pinecone to process millions of documents with 99% accuracy.',
      es: 'Alejandro tiene amplia experiencia construyendo soluciones RAG de vanguardia para empresas del Fortune 500, usando LangChain y Pinecone para procesar millones de documentos con un 99 % de precisión.',
    },
    cites: ['proj-sangi', 'proj-jairo'],
  },
  {
    id: 'q-eval',
    question: {
      en: 'How do you evaluate retrieval quality?',
      es: '¿Cómo evalúas la calidad de la recuperación?',
    },
    answer: {
      en: 'With a test set built before any tuning: real questions with their expected sources. I measure recall@k (is the right document in the top k?) and MRR (how high is it?), and only then compare chunking, fusion or reranking options. Without that set, every change is a guess.',
      es: 'Con un conjunto de pruebas construido antes de ajustar nada: preguntas reales con sus fuentes esperadas. Mido recall@k (¿está el documento correcto entre los k primeros?) y MRR (¿en qué posición?), y solo entonces comparo opciones de troceado, fusión o rerank. Sin ese conjunto, cada cambio es una apuesta.',
    },
    ungrounded: {
      en: 'Retrievers are usually evaluated by checking a few queries manually and seeing whether the results look reasonable. If the answers seem good, the retriever is working well.',
      es: 'Los sistemas de recuperación se suelen evaluar probando unas cuantas consultas a mano y viendo si los resultados parecen razonables. Si las respuestas tienen buena pinta, el sistema funciona bien.',
    },
    cites: ['eval-metrics', 'eval-why'],
  },
  {
    id: 'q-reranker',
    question: {
      en: 'Why did you reject a reranker?',
      es: '¿Por qué descartaste un reranker?',
    },
    answer: {
      en: 'Because the evaluation said so. On Sangi we compared variants on 103 cases: plain rank fusion reached an MRR of 0.73 on the held-out split, while the reranker lowered recall@10 from 0.92 to 0.85 and added about 4.8 seconds. A reranker has to earn its latency, and that one did not.',
      es: 'Porque lo dijo la evaluación. En Sangi comparamos variantes con 103 casos: la fusión por rango alcanzó un MRR de 0,73 en la parte de reserva, mientras que el reranker bajaba el recall@10 de 0,92 a 0,85 y añadía unos 4,8 segundos. Un reranker tiene que ganarse su latencia, y ese no lo hizo.',
    },
    ungrounded: {
      en: 'Rerankers always improve retrieval quality, so there is rarely a reason to reject one. It is considered best practice to add a reranker to every RAG pipeline.',
      es: 'Los rerankers siempre mejoran la calidad de la recuperación, así que rara vez hay motivo para descartar uno. Se considera buena práctica añadir un reranker a todo pipeline RAG.',
    },
    cites: ['proj-sangi-eval', 'rag-rerank'],
  },
  {
    id: 'q-hallucination',
    question: {
      en: 'How do you stop a model from making unsupported claims?',
      es: '¿Cómo evitas que un modelo haga afirmaciones sin respaldo?',
    },
    answer: {
      en: 'First I measure it: on Sangi, an audit found unsupported claims in 26 of 36 real answers. Then I put the checks in code, outside the model: a claim gate and an evidence gate block any statement the retrieved data does not back. And the answer must cite its sources, or say that it does not know.',
      es: 'Primero lo mido: en Sangi, una auditoría encontró afirmaciones sin respaldo en 26 de 36 respuestas reales. Después pongo las comprobaciones en código, fuera del modelo: una puerta de afirmaciones y otra de evidencia bloquean lo que los datos recuperados no respaldan. Y la respuesta debe citar sus fuentes o decir que no lo sabe.',
    },
    ungrounded: {
      en: 'Hallucinations can be fully eliminated by adding "do not make things up" to the system prompt and lowering the temperature to zero.',
      es: 'Las alucinaciones se pueden eliminar por completo añadiendo «no te inventes nada» al prompt de sistema y bajando la temperatura a cero.',
    },
    cites: ['proj-sangi-gate', 'brain-guardrails', 'rag-grounding'],
  },
  {
    id: 'q-memory',
    question: {
      en: 'How does an assistant remember each client?',
      es: '¿Cómo recuerda un asistente a cada cliente?',
    },
    answer: {
      en: 'By extracting durable facts about the user from each conversation, removing duplicates, and bringing back only the relevant ones later. On JairoFitness that memory sits next to the knowledge base and the reviewed coaching cases, so the coach remembers each client.',
      es: 'Extrayendo de cada conversación los hechos duraderos sobre el usuario, eliminando duplicados y recuperando después solo los relevantes. En JairoFitness esa memoria convive con la base de conocimiento y los casos de coaching revisados, de modo que el coach recuerda a cada cliente.',
    },
    ungrounded: {
      en: 'Modern language models remember every user automatically, because all past conversations are stored inside the model weights after each chat.',
      es: 'Los modelos de lenguaje modernos recuerdan a cada usuario automáticamente, porque todas las conversaciones pasadas quedan guardadas en los pesos del modelo después de cada chat.',
    },
    cites: ['brain-memory', 'proj-jairo'],
  },
  {
    id: 'q-embedding',
    question: {
      en: 'What is an embedding and how do you compare two vectors?',
      es: '¿Qué es un embedding y cómo se comparan dos vectores?',
    },
    answer: {
      en: 'A way to turn text into a list of numbers so that similar meanings end up close together, even with no words in common. Closeness is measured with cosine similarity, the angle between two vectors. It ignores the length of the vector and looks only at its direction: 1 means the same meaning, 0 means unrelated.',
      es: 'Una forma de convertir texto en una lista de números para que los significados parecidos queden cerca, aunque no compartan palabras. La cercanía se mide con la similitud coseno, el ángulo entre dos vectores. Ignora la longitud del vector y mira solo su dirección: 1 es el mismo significado y 0 es que no tienen relación.',
    },
    ungrounded: {
      en: 'An embedding is a compressed copy of a document, similar to a zip file, that the model can decompress to read the original text.',
      es: 'Un embedding es una copia comprimida de un documento, parecida a un archivo zip, que el modelo puede descomprimir para leer el texto original.',
    },
    cites: ['emb-what', 'emb-cosine'],
  },
  {
    id: 'q-hybrid',
    question: {
      en: 'Why combine keyword search and vector search, and how do you merge them?',
      es: '¿Por qué combinar búsqueda por palabras clave y vectorial, y cómo las fusionas?',
    },
    answer: {
      en: 'Because they fail in opposite ways. Vector search understands meaning but misses exact names and codes; keyword search finds those but not paraphrases. I run both and merge them with reciprocal rank fusion, which uses positions instead of scores that are not comparable.',
      es: 'Porque fallan de forma opuesta. La búsqueda vectorial entiende el significado pero falla con nombres y códigos exactos; la de palabras clave los encuentra, pero no las paráfrasis. Lanzo las dos y las fusiono por rango recíproco, que usa posiciones en lugar de puntuaciones que no son comparables.',
    },
    ungrounded: {
      en: 'Keyword search is obsolete. Vector search is strictly better in every case, so combining them only adds complexity without any benefit.',
      es: 'La búsqueda por palabras clave está obsoleta. La vectorial es estrictamente mejor en todos los casos, así que combinarlas solo añade complejidad sin ningún beneficio.',
    },
    cites: ['rag-hybrid', 'rag-rrf'],
  },
  {
    id: 'q-you',
    question: {
      en: 'Who are you and what are you looking for?',
      es: '¿Quién eres y qué buscas?',
    },
    answer: {
      en: 'I am Alejandro Tiscar, an AI engineer. I build retrieval systems, assistants with memory and the evaluation that keeps them honest, with the team at The AI Business. I am looking for a role where retrieval, knowledge bases and assistants are the product, not a side feature.',
      es: 'Soy Alejandro Tiscar, ingeniero de IA. Construyo sistemas de recuperación, asistentes con memoria y la evaluación que los mantiene honestos, con el equipo de The AI Business. Busco un puesto donde la recuperación, las bases de conocimiento y los asistentes sean el producto y no un añadido.',
    },
    ungrounded: {
      en: 'Alejandro is a senior researcher with a PhD in machine learning and ten years of experience at leading AI labs, currently open to executive positions.',
      es: 'Alejandro es un investigador sénior con un doctorado en aprendizaje automático y diez años de experiencia en laboratorios punteros de IA, actualmente abierto a puestos directivos.',
    },
    cites: ['about-me', 'about-contact'],
  },
];
