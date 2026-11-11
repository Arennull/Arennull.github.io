import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useI18n } from '../i18n';
import {
  applyEvent,
  EMPTY_PROGRESS,
  levelOf,
  parseProgress,
  xpOf,
  type Progress,
  type ProgressEvent,
} from '../lib/progress';

const STORAGE_KEY = 'progress';
const TOAST_MS = 1800;

interface Toast {
  id: number;
  text: string;
  big: boolean;
}

interface Game {
  progress: Progress;
  xp: number;
  gain: (event: ProgressEvent) => void;
  reset: () => void;
  toasts: Toast[];
}

const GameContext = createContext<Game | null>(null);

function load(): Progress {
  try {
    return parseProgress(localStorage.getItem(STORAGE_KEY));
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [progress, setProgress] = useState(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const xp = xpOf(progress);
  const lastXp = useRef(xp);
  const nextToast = useRef(0);

  const gain = useCallback((event: ProgressEvent) => {
    setProgress((p) => applyEvent(p, event));
  }, []);

  const reset = useCallback(() => {
    lastXp.current = 0;
    setProgress(EMPTY_PROGRESS);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // A blocked storage only means the game does not survive a reload.
    }
  }, [progress]);

  // Announce what was just earned.
  useEffect(() => {
    const before = lastXp.current;
    lastXp.current = xp;
    if (xp <= before) return;
    const fresh: Toast[] = [{ id: nextToast.current++, text: t.toast.xp(xp - before), big: false }];
    const level = levelOf(xp).level;
    if (level > levelOf(before).level) {
      fresh.push({
        id: nextToast.current++,
        text: t.toast.levelUp(t.ranks[level - 1] ?? ''),
        big: true,
      });
    }
    setToasts((list) => [...list, ...fresh]);
    const ids = new Set(fresh.map((f) => f.id));
    // No cleanup on purpose: each batch of toasts removes itself, even if more XP arrives first.
    window.setTimeout(
      () => setToasts((list) => list.filter((toast) => !ids.has(toast.id))),
      TOAST_MS,
    );
    // The toast text is fixed when it is earned; a later language switch should not replay it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xp]);

  const value = useMemo(
    () => ({ progress, xp, gain, reset, toasts }),
    [progress, xp, gain, reset, toasts],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): Game {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
