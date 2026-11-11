import { LANGS, type Lang } from '../lib/types';

/** First path segment of each language. English lives at the root. */
export const LANG_SEGMENT: Record<Lang, string> = { en: '', es: 'es', ja: 'jp' };

/** What the language switch shows. */
export const LANG_LABEL: Record<Lang, string> = { en: 'EN', es: 'ES', ja: 'JP' };

export function langFromPath(pathname: string): Lang {
  const segment = pathname.split('/')[1]?.toLowerCase() ?? '';
  return LANGS.find((lang) => LANG_SEGMENT[lang] === segment) ?? 'en';
}

export function pathForLang(lang: Lang): string {
  const segment = LANG_SEGMENT[lang];
  return segment ? `/${segment}/` : '/';
}

export function nextLang(lang: Lang): Lang {
  return LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]!;
}
