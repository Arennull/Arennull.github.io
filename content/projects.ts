import type { L10n } from '../src/lib/types';

export interface Project {
  id: string;
  name: string;
  featured: boolean;
  tagline: L10n;
  summary: L10n;
  points: Record<'en' | 'es', string[]>;
  metrics: { value: string; label: L10n }[];
  stack: string[];
  url?: string;
  /** Neuron to select in the brain when the card asks for it. */
  neuron?: string;
}

export const projects: Project[] = [
  {
    id: 'sangi',
    name: 'Sangi',
    featured: true,
    tagline: {
      en: 'RAG chat over a curated archive of designer footwear',
      es: 'Chat RAG sobre un archivo curado de calzado de diseñador',
    },
    summary: {
      en: 'An editorial archive where visitors ask in plain language and get answers grounded in the catalogue and the magazine. Built with the team at The AI Business.',
      es: 'Un archivo editorial donde el visitante pregunta en lenguaje natural y recibe respuestas fundamentadas en el catálogo y la revista. Construido con el equipo de The AI Business.',
    },
    points: {
      en: [
        'Hybrid retrieval: vector search on pgvector with HNSW indexes plus lexical search, merged by reciprocal rank fusion with a rarity bonus.',
        'Incremental ingestion: chunks are hashed and only what changed is embedded again, driven by queues and scheduled jobs.',
        'A deterministic claim gate and evidence gate outside the model, added after an audit found unsupported claims in 26 of 36 real answers.',
        'Evaluation on 103 cases with a held-out split. A reranker was tested and rejected on the numbers.',
      ],
      es: [
        'Recuperación híbrida: búsqueda vectorial en pgvector con índices HNSW más búsqueda léxica, fusionadas por rango recíproco con un bono de rareza.',
        'Ingesta incremental: se calcula el hash de cada trozo y solo se vuelve a vectorizar lo que cambió, con colas y tareas programadas.',
        'Puertas deterministas de afirmaciones y de evidencia fuera del modelo, añadidas tras una auditoría que encontró afirmaciones sin respaldo en 26 de 36 respuestas reales.',
        'Evaluación con 103 casos y una parte de reserva. Se probó un reranker y se descartó con los números en la mano.',
      ],
    },
    metrics: [
      { value: '0.73', label: { en: 'MRR on held-out cases', es: 'MRR en casos de reserva' } },
      { value: '103', label: { en: 'evaluation cases', es: 'casos de evaluación' } },
      {
        value: '−4.8 s',
        label: {
          en: 'latency saved by rejecting the reranker',
          es: 'latencia ahorrada al descartar el reranker',
        },
      },
    ],
    stack: ['Supabase', 'pgvector', 'HNSW', 'Edge Functions', 'React', 'TypeScript', 'Playwright'],
    url: 'https://www.sangi-observatory.com/',
    neuron: 'proj-sangi',
  },
  {
    id: 'jairofitness',
    name: 'JairoFitness',
    featured: true,
    tagline: {
      en: 'An AI coach that answers in the voice of the real one',
      es: 'Un coach de IA que responde con la voz del coach real',
    },
    summary: {
      en: 'An online coaching platform where clients chat, by text and voice, with an assistant that carries the personality and criteria of the coach. Built with the team at The AI Business.',
      es: 'Una plataforma de coaching online donde los clientes hablan, por texto y voz, con un asistente que lleva la personalidad y el criterio del coach. Construido con el equipo de The AI Business.',
    },
    points: {
      en: [
        'Knowledge base on pgvector, with a startup check that the stored vectors and the query model match.',
        'Long-term memory: durable facts about each client are extracted, de-duplicated and recalled when relevant.',
        'Decision cases reviewed by the coach are ranked and injected, so the assistant follows his criteria and not generic advice.',
        'Input and output filters in code, cost and latency recorded per call, and blind A/B evaluation with a model as judge.',
      ],
      es: [
        'Base de conocimiento en pgvector, con una comprobación al arrancar de que los vectores guardados y el modelo de consulta coinciden.',
        'Memoria a largo plazo: se extraen los hechos duraderos de cada cliente, se eliminan duplicados y se recuperan cuando son relevantes.',
        'Los casos de decisión revisados por el coach se ordenan e inyectan, para que el asistente siga su criterio y no consejos genéricos.',
        'Filtros de entrada y de salida en código, coste y latencia registrados por llamada, y evaluación A/B a ciegas con un modelo como juez.',
      ],
    },
    metrics: [
      {
        value: '31%',
        label: {
          en: 'of blind tests: judge took the AI for the coach',
          es: 'de las pruebas a ciegas: el juez tomó a la IA por el coach',
        },
      },
      {
        value: '0 / 5,041',
        label: {
          en: 'false positives of the output filter',
          es: 'falsos positivos del filtro de salida',
        },
      },
      { value: '1.7 s', label: { en: 'p95 latency', es: 'latencia p95' } },
    ],
    stack: ['Express', 'Prisma', 'pgvector', 'WebSockets', 'React', 'TanStack', 'Railway'],
    neuron: 'proj-jairo',
  },
  {
    id: 'market-movers',
    name: 'Market Movers',
    featured: false,
    tagline: { en: 'AI features inside a B2B CRM', es: 'Funciones de IA dentro de un CRM B2B' },
    summary: {
      en: 'Meeting briefs where every statement cites its source, cached by a hash of the deal context; structured outputs; token, cost and latency telemetry on every AI call.',
      es: 'Briefs de reunión donde cada afirmación cita su fuente, cacheados por un hash del contexto del negocio; salidas estructuradas; telemetría de tokens, coste y latencia en cada llamada de IA.',
    },
    points: { en: [], es: [] },
    metrics: [],
    stack: ['Next.js', 'tRPC', 'Supabase', 'Structured Outputs'],
    neuron: 'proj-market',
  },
  {
    id: 'proyectasport',
    name: 'Proyectasport',
    featured: false,
    tagline: {
      en: 'After-school sports platform for schools and families',
      es: 'Plataforma de actividades extraescolares para colegios y familias',
    },
    summary: {
      en: 'Enrolments, instalment payments and a family portal. Role-based permissions with automatic scoping, HMAC-signed links and a waiting list with automatic promotion.',
      es: 'Inscripciones, pagos por cuotas y portal de familias. Permisos por rol con filtrado automático por alcance, enlaces firmados con HMAC y lista de espera con promoción automática.',
    },
    points: { en: [], es: [] },
    metrics: [],
    stack: ['NestJS', 'Prisma', 'PostgreSQL', 'React', 'Docker'],
    url: 'https://www.proyectasport.com',
    neuron: 'proj-platforms',
  },
  {
    id: 'catalyst',
    name: 'Catalyst',
    featured: false,
    tagline: { en: 'HR and timesheet platform', es: 'Plataforma de RR. HH. y partes de horas' },
    summary: {
      en: 'A monorepo with shared Zod contracts between web and API, weekly timesheets with optimistic concurrency, and time detected in Linear turned into billable hours.',
      es: 'Un monorepo con contratos Zod compartidos entre web y API, partes semanales con concurrencia optimista y tiempo detectado en Linear convertido en horas imputables.',
    },
    points: { en: [], es: [] },
    metrics: [],
    stack: ['Turborepo', 'Next.js', 'Express', 'Prisma', 'Zod'],
    neuron: 'proj-platforms',
  },
  {
    id: 'private-equity',
    name: 'Private Equity Club',
    featured: false,
    tagline: { en: 'Real-estate investment ERP', es: 'ERP de inversión inmobiliaria' },
    summary: {
      en: 'Companies, projects, investors, returns, signatures and KYC in one system, with a configurable automation builder and integrations for invoicing and identity checks.',
      es: 'Sociedades, proyectos, inversores, retornos, firmas y KYC en un solo sistema, con un constructor de automatizaciones configurable e integraciones de facturación y verificación de identidad.',
    },
    points: { en: [], es: [] },
    metrics: [],
    stack: ['Next.js', 'tRPC', 'Prisma', 'PostgreSQL'],
    neuron: 'proj-platforms',
  },
];
