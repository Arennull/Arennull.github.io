import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useI18n } from '../i18n';
import { LANG_LABEL, nextLang } from '../i18n/routes';
import { useGame } from './progress';
import { useSound } from './sfx';
import { Avatar } from './sprites';

export function Title({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const { t, lang, setLang } = useI18n();
  const { xp, reset } = useGame();
  const [sound, setSound] = useSound();
  const menu = useRef<HTMLDivElement>(null);
  // Starting over erases a saved game, so it takes a second press.
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    menu.current?.querySelector('button')?.focus();
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const buttons = [...(menu.current?.querySelectorAll('button') ?? [])];
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const step = e.key === 'ArrowDown' ? 1 : -1;
    buttons[(current + step + buttons.length) % buttons.length]?.focus();
    e.preventDefault();
  };

  const option = (label: string, action: () => void) => (
    <button type="button" onClick={action}>
      <span className="cursor" aria-hidden>
        ▶
      </span>
      {label}
    </button>
  );

  return (
    <div className="title">
      <Avatar size={96} />
      <h1>{t.hero.name}</h1>
      <p className="title-role">{t.hero.role}</p>
      <p className="title-tag">{t.title.tagline}</p>
      <div className="title-menu" ref={menu} onKeyDown={onKeyDown}>
        {xp > 0 && option(t.title.continue, onStart)}
        {option(confirming ? t.title.confirm : t.title.start, () => {
          if (xp > 0 && !confirming) return setConfirming(true);
          reset();
          onStart();
        })}
        {option(`${t.title.sound}: ${sound ? t.title.on : t.title.off}`, () => setSound(!sound))}
        {option(`${t.title.language}: ${LANG_LABEL[lang]}`, () => setLang(nextLang(lang)))}
        {option(t.skip, onSkip)}
      </div>
      <small className="title-hint">↑ ↓ Enter</small>
    </div>
  );
}
