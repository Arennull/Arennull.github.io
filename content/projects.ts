import type { L10n } from '../src/lib/types';

export interface Project {
  id: string;
  name: string;
  /** The name shown is made up: the real client is not named. */
  codename?: boolean;
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
  {
    id: 'abacus',
    name: 'Abacus',
    codename: true,
    featured: false,
    tagline: { en: 'Sales and commission CRM', es: 'CRM de ventas y comisiones' },
    summary: {
      en: 'An open-source CRM extended only through its supported extension points, so upstream can still be merged. The commission split is configuration, and each won deal keeps an immutable snapshot of it. Runs on a shared Postgres with its own schema, sign-in and file storage adapters.',
      es: 'Un CRM de código abierto ampliado solo por sus puntos de extensión, para poder seguir integrando la versión original. El reparto de comisiones es configuración y cada venta ganada guarda una copia inmutable. Funciona sobre un Postgres compartido con su propio esquema y adaptadores de acceso y de archivos.',
    },
    points: { en: [], es: [] },
    metrics: [
      { value: '31', label: { en: 'test files of its own', es: 'archivos de test propios' } },
      {
        value: '0',
        label: { en: 'upstream files modified', es: 'archivos originales modificados' },
      },
    ],
    stack: ['PHP', 'EspoCRM', 'PostgreSQL', 'Supabase', 'Docker', 'PHPUnit'],
    neuron: 'proj-crm',
  },
  {
    id: 'pitlane',
    name: 'Pitlane',
    codename: true,
    featured: false,
    tagline: {
      en: 'Website, admin panel and API for a car dealership',
      es: 'Web, panel y API para un concesionario',
    },
    summary: {
      en: 'A public catalogue with an interactive garage, an admin panel for stock and leads, and an API. The server writes meta tags and structured data per route from live data, so crawlers that run no JavaScript still read every car. Layered rate limits and a demo mode that works with no database.',
      es: 'Un catálogo público con garaje interactivo, un panel para stock y leads, y una API. El servidor escribe las etiquetas y los datos estructurados de cada ruta con datos reales, para que los rastreadores sin JavaScript lean cada coche. Límites de peticiones por capas y un modo demo que funciona sin base de datos.',
    },
    points: { en: [], es: [] },
    metrics: [
      { value: '−96%', label: { en: 'hero image weight', es: 'peso de la imagen principal' } },
      {
        value: '46',
        label: { en: 'API, SEO and end-to-end tests', es: 'tests de API, SEO y e2e' },
      },
    ],
    stack: ['Express', 'Prisma', 'Supabase', 'React', 'Vite', 'Playwright', 'Railway'],
    neuron: 'proj-web-geo',
  },
  {
    id: 'showhome',
    name: 'Showhome',
    codename: true,
    featured: false,
    tagline: {
      en: 'Lead-capture site for a home staging business',
      es: 'Web de captación para un negocio de home staging',
    },
    summary: {
      en: 'A step-by-step calculator that ends in a personalised PDF report. Leads land in a shared spreadsheet guarded by two locks, one inside the process and one between instances. The page is pre-rendered so AI search engines can read and cite it.',
      es: 'Una calculadora por pasos que termina en un informe PDF personalizado. Los leads llegan a una hoja de cálculo compartida protegida por dos cerrojos, uno dentro del proceso y otro entre instancias. La página se prerrenderiza para que los buscadores de IA puedan leerla y citarla.',
    },
    points: { en: [], es: [] },
    metrics: [
      {
        value: '37 → 68',
        label: { en: 'AI-search audit score', es: 'nota en la auditoría de búsqueda con IA' },
      },
      { value: '72', label: { en: 'test cases, run in CI', es: 'casos de test, en CI' } },
    ],
    stack: ['React', 'Vite', 'Express', 'Google Drive API', 'SendGrid', 'Vitest', 'GitHub Actions'],
    neuron: 'proj-web-geo',
  },
  {
    id: 'pitchsmith',
    name: 'Pitchsmith',
    codename: true,
    featured: false,
    tagline: {
      en: 'From a sales call to a written proposal',
      es: 'De una llamada comercial a una propuesta escrita',
    },
    summary: {
      en: 'An internal two-stage language-model pipeline. The first stage turns a call transcript into strict JSON where every proposed solution must point to a pain the client actually voiced, and anything doubtful is flagged. The second writes the proposal, which a headless browser exports as a full-page PDF.',
      es: 'Un pipeline interno de modelos de lenguaje en dos fases. La primera convierte la transcripción de una llamada en JSON estricto donde cada solución propuesta debe apuntar a un problema que el cliente dijo de verdad, y lo dudoso queda marcado. La segunda redacta la propuesta, que un navegador sin interfaz exporta como PDF a página completa.',
    },
    points: { en: [], es: [] },
    metrics: [],
    stack: ['n8n', 'OpenAI', 'Puppeteer', 'Chrome extension', 'Express'],
    neuron: 'proj-pipeline',
  },
  {
    id: 'kettlebell',
    name: 'Kettlebell',
    codename: true,
    featured: false,
    tagline: {
      en: 'Contributor to a subscription fitness app',
      es: 'Colaborador en una app de fitness por suscripción',
    },
    summary: {
      en: 'A web and mobile product built by the team, where I shipped fixes and features in check-ins, nutrition, challenges and ranking, plus an Android release. Underneath: access scoped to the owner on the server, card payments granted only by an idempotent webhook, and an AI check-in coach behind a swappable interface.',
      es: 'Un producto web y móvil hecho por el equipo, donde entregué arreglos y funciones en check-ins, nutrición, retos y ranking, además de una versión de Android. Por debajo: acceso limitado al propietario en el servidor, pagos con tarjeta que solo concede un webhook idempotente y un coach de check-in con IA detrás de una interfaz intercambiable.',
    },
    points: { en: [], es: [] },
    metrics: [],
    stack: ['Bun', 'Express', 'Prisma', 'Supabase', 'React', 'Capacitor', 'OpenAI'],
    neuron: 'proj-payments',
  },
  {
    id: 'apothecary',
    name: 'Apothecary',
    codename: true,
    featured: false,
    tagline: {
      en: 'Shop for personalised skincare routines',
      es: 'Tienda de rutinas de cuidado personalizadas',
    },
    summary: {
      en: 'Routine builder, card payment, a questionnaire with photos after paying, and invoices. The payment gateway is integrated by hand with signature checks, photo links are signed and expire, invoices are written atomically as PDF, and the marketing pixel waits for consent.',
      es: 'Configurador de rutina, pago con tarjeta, un cuestionario con fotos después de pagar y facturas. La pasarela de pago está integrada a mano con verificación de firma, los enlaces a las fotos van firmados y caducan, las facturas se escriben de forma atómica en PDF y el píxel de marketing espera al consentimiento.',
    },
    points: { en: [], es: [] },
    metrics: [],
    stack: ['Next.js', 'React', 'Tailwind', 'Redsys', 'pdf-lib', 'Railway'],
    neuron: 'proj-payments',
  },
  {
    id: 'signpost',
    name: 'Signpost',
    codename: true,
    featured: false,
    tagline: {
      en: 'Bilingual company website',
      es: 'Web corporativa bilingüe',
    },
    summary: {
      en: 'A marketing site in two languages with scroll animation and video. Alternate-language links and structured data match the content, video adapts to the device, motion respects the reduced-motion setting, and every route has an end-to-end test.',
      es: 'Una web de marketing en dos idiomas con animación al hacer scroll y vídeo. Los enlaces entre idiomas y los datos estructurados coinciden con el contenido, el vídeo se adapta al dispositivo, el movimiento respeta la preferencia de reducirlo y cada ruta tiene un test de extremo a extremo.',
    },
    points: { en: [], es: [] },
    metrics: [
      {
        value: '100/100',
        label: { en: 'AI crawler access audit', es: 'auditoría de acceso de rastreadores de IA' },
      },
    ],
    stack: ['Next.js', 'next-intl', 'GSAP', 'Playwright', 'Docker'],
    neuron: 'proj-web-geo',
  },
];
