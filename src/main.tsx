import '@fontsource-variable/pixelify-sans';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource/dotgothic16/japanese-400.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n';
import './styles.css';
import { GameProvider } from './ui/progress';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </I18nProvider>
  </StrictMode>,
);
