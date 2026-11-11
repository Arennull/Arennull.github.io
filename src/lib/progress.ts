/** What the visitor has done so far. Everything else (XP, level, objectives) derives from it. */
export interface Progress {
  discovered: string[];
  asked: string[];
  quests: string[];
  /** Best score per trial. */
  trials: Record<string, number>;
  recruited: boolean;
}

export type ProgressEvent =
  | { type: 'discover'; ids: string[] }
  | { type: 'ask'; id: string }
  | { type: 'quest'; id: string }
  | { type: 'trial'; id: TrialId; score: number }
  | { type: 'recruit' };

export type TrialId = 'retriever' | 'chunking' | 'closer';

export const EMPTY_PROGRESS: Progress = {
  discovered: [],
  asked: [],
  quests: [],
  trials: {},
  recruited: false,
};

/** XP per unit and the score at which a trial stops paying out. */
export const TRIALS: Record<TrialId, { xp: number; max: number }> = {
  retriever: { xp: 10, max: 9 },
  chunking: { xp: 30, max: 3 },
  closer: { xp: 15, max: 5 },
};

const XP = { neuron: 10, ask: 30, quest: 40, recruit: 100 };

/** XP needed to reach each level; index 0 is level 1. */
export const LEVELS = [0, 60, 160, 320, 520, 780, 1100];

const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];

export function applyEvent(p: Progress, event: ProgressEvent): Progress {
  switch (event.type) {
    case 'discover':
      return { ...p, discovered: union(p.discovered, event.ids) };
    case 'ask':
      return { ...p, asked: union(p.asked, [event.id]) };
    case 'quest':
      return { ...p, quests: union(p.quests, [event.id]) };
    case 'trial': {
      const score = Math.min(TRIALS[event.id].max, Math.max(0, event.score));
      if (score <= (p.trials[event.id] ?? 0)) return p;
      return { ...p, trials: { ...p.trials, [event.id]: score } };
    }
    case 'recruit':
      return p.recruited ? p : { ...p, recruited: true };
  }
}

export function xpOf(p: Progress): number {
  const trials = (Object.keys(TRIALS) as TrialId[]).reduce(
    (sum, id) => sum + Math.min(TRIALS[id].max, p.trials[id] ?? 0) * TRIALS[id].xp,
    0,
  );
  return (
    p.discovered.length * XP.neuron +
    p.asked.length * XP.ask +
    p.quests.length * XP.quest +
    trials +
    (p.recruited ? XP.recruit : 0)
  );
}

export interface LevelInfo {
  level: number;
  /** 0–1 towards the next level; 1 at the last level. */
  fraction: number;
  next: number | null;
}

export function levelOf(xp: number): LevelInfo {
  let level = 1;
  while (level < LEVELS.length && xp >= LEVELS[level]!) level++;
  const floor = LEVELS[level - 1]!;
  const next = LEVELS[level] ?? null;
  return { level, next, fraction: next === null ? 1 : (xp - floor) / (next - floor) };
}

export interface Objectives {
  explore: boolean;
  ask: boolean;
  trial: boolean;
  quest: boolean;
  recruit: boolean;
}

export const EXPLORE_GOAL = 8;

export function objectivesOf(p: Progress): Objectives {
  return {
    explore: p.discovered.length >= EXPLORE_GOAL,
    ask: p.asked.length > 0,
    trial: Object.values(p.trials).some((score) => score > 0),
    quest: p.quests.length > 0,
    recruit: p.recruited,
  };
}

/** Reads saved progress defensively: anything malformed starts a new game. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return EMPTY_PROGRESS;
  try {
    const data = JSON.parse(raw) as Partial<Progress>;
    const strings = (value: unknown) =>
      Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : [];
    const trials: Record<string, number> = {};
    for (const id of Object.keys(TRIALS)) {
      const score = (data.trials as Record<string, unknown> | undefined)?.[id];
      if (typeof score === 'number' && Number.isFinite(score)) trials[id] = score;
    }
    return {
      discovered: strings(data.discovered),
      asked: strings(data.asked),
      quests: strings(data.quests),
      trials,
      recruited: data.recruited === true,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}
