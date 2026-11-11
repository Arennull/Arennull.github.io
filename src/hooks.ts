import { useEffect, useState, type RefObject } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/** Phones and small machines get fewer particles and no post-processing. */
export function useLowPower(): boolean {
  const narrow = useMediaQuery('(max-width: 820px)');
  return narrow || (navigator.hardwareConcurrency ?? 8) <= 4;
}

export function useInView(ref: RefObject<Element | null>): boolean {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

/** Reveals `text` a few characters at a time. Returns the full text when disabled. */
export function useTyped(text: string, enabled: boolean): string {
  const [typed, setTyped] = useState({ text, enabled, length: 0 });
  // Restart whenever the text changes or typing is switched on (derived state).
  const current = typed.text === text && typed.enabled === enabled;
  if (!current) setTyped({ text, enabled, length: 0 });

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      setTyped((t) => (t.length >= t.text.length ? t : { ...t, length: t.length + 3 }));
    }, 16);
    return () => window.clearInterval(id);
  }, [enabled, text]);

  return enabled ? text.slice(0, current ? typed.length : 0) : text;
}
