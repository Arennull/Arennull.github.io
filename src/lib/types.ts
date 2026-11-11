export type Lang = 'en' | 'es' | 'ja';
export const LANGS: Lang[] = ['en', 'es', 'ja'];
export type L10n = Record<Lang, string>;

export type Cluster = 'rag' | 'embeddings' | 'brains' | 'eval' | 'projects' | 'about';

export const CLUSTERS: Cluster[] = ['rag', 'embeddings', 'brains', 'eval', 'projects', 'about'];

export interface KnowledgeNode {
  id: string;
  cluster: Cluster;
  title: L10n;
  text: L10n;
}

export interface PreparedQuery {
  id: string;
  question: L10n;
  /** Answer written from the cited fragments. */
  answer: L10n;
  /** What a model tends to say with no retrieval: fluent, generic, unverifiable. */
  ungrounded: L10n;
  /** Fragments the answer was written from; a test checks retrieval really returns them. */
  cites: string[];
}

export interface Concept {
  id: string;
  label: L10n;
}

export interface ChunkingQuestion {
  id: string;
  question: L10n;
  /** Exact substring of the lab text that answers the question. */
  answer: L10n;
}

export interface BrainData {
  model: string;
  dims: number;
  nodes: { id: string; pos: [number, number, number]; vec: string }[];
  edges: [number, number, number][];
  queries: { id: string; vec: string }[];
  concepts: { id: string; vec: string }[];
  chunking: Record<
    Lang,
    {
      configs: { size: number; overlap: number; vecs: string[] }[];
      questions: { id: string; vec: string }[];
    }
  >;
}
