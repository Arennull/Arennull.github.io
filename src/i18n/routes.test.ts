import { describe, expect, it } from 'vitest';
import { LANGS } from '../lib/types';
import { langFromPath, nextLang, pathForLang } from './routes';

describe('language routes', () => {
  it.each([
    ['/', 'en'],
    ['/es', 'es'],
    ['/es/', 'es'],
    ['/ES/', 'es'],
    ['/jp', 'ja'],
    ['/jp/', 'ja'],
    ['/jp/index.html', 'ja'],
    ['/anything-else', 'en'],
    ['/espresso', 'en'],
  ])('%s is %s', (path, lang) => {
    expect(langFromPath(path)).toBe(lang);
  });

  it('every language comes back from its own path', () => {
    for (const lang of LANGS) expect(langFromPath(pathForLang(lang))).toBe(lang);
  });

  it('the switch goes through every language and returns', () => {
    expect(LANGS.map(nextLang)).toEqual(['es', 'ja', 'en']);
  });
});
