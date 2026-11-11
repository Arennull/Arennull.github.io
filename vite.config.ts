/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    // One page per language, so /es/ and /jp/ exist as real files on a static host.
    rollupOptions: { input: ['index.html', 'es/index.html', 'jp/index.html'] },
  },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
