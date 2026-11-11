import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Lang } from '../lib/types';
import { langFromPath, pathForLang } from './routes';
import { strings, type Strings } from './strings';

interface I18n {
  lang: Lang;
  t: Strings;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18n | null>(null);

/** The address decides the language: `/` is English, `/es/` Spanish, `/jp/` Japanese. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => langFromPath(location.pathname));

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = strings[lang].meta.title;
  }, [lang]);

  useEffect(() => {
    const onPop = () => setLangState(langFromPath(location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const setLang = useCallback((next: Lang) => {
    if (langFromPath(location.pathname) !== next) {
      history.pushState(null, '', pathForLang(next) + location.search + location.hash);
    }
    setLangState(next);
  }, []);

  const value = useMemo(() => ({ lang, t: strings[lang], setLang }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
