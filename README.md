# Portfolio de Alejandro Tiscar

Web personal publicada en <https://arennull.github.io>, planteada como un pequeño RPG: el mapa es un cerebro 3D cuyas neuronas son fragmentos de conocimiento con embeddings reales. El visitante las descubre, pregunta al Oráculo, supera pruebas y gana experiencia.

## Qué hay dentro

- **Mapa** (Three.js con React Three Fiber, renderizado en píxeles): corteza de partículas generada por código; cada neurona se coloca según la proyección UMAP de su embedding y empieza oculta hasta que se descubre.
- **Oráculo**: para cada pregunta se calcula en el navegador la búsqueda vectorial (coseno), la búsqueda por palabras (BM25) y su fusión por rango recíproco. Solo la redacción de la respuesta está escrita de antemano.
- **Pruebas**: «Sé el retriever», «Chunking lab» y «Más cerca o más lejos».
- **Misiones** (proyectos) y **Héroe** (ficha, stack y contacto).
- Progreso con XP, niveles y objetivos, guardado en el navegador.
- Bilingüe (inglés y español), sin backend y sin claves. Botón «Saltar al CV» para quien no quiera jugar.

## Cómo funciona

```
content/                 textos: fragmentos, preguntas, juegos y proyectos (en/es)
scripts/build-brain.ts   vectoriza el contenido y escribe src/data/brain.json
src/lib/                 lógica pura con tests: vectores, BM25, RRF, troceado, progreso
src/brain/               escena 3D
src/games/               minijuegos
src/ui/                  HUD, menú, diálogo y paneles del juego
```

Los embeddings se calculan una vez, al ejecutar `npm run build:brain`, con el modelo multilingüe `paraphrase-multilingual-MiniLM-L12-v2` (384 dimensiones). Los vectores se cuantizan a 8 bits y se guardan en `src/data/brain.json`, que está en el repositorio: ni la CI ni el navegador descargan el modelo.

## Desarrollo

Requiere Node 22 o superior (la versión fijada está en `.nvmrc`).

```bash
npm install
npm run dev
```

| Comando                | Qué hace                                              |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo                                |
| `npm run build`        | Typecheck y build de producción en `dist/`            |
| `npm run lint`         | ESLint                                                |
| `npm run typecheck`    | TypeScript sin emitir                                 |
| `npm run test`         | Tests con Vitest                                      |
| `npm run format:check` | Comprueba el formato con Prettier                     |
| `npm run verify`       | lint + typecheck + test + build                       |
| `npm run build:brain`  | Regenera `brain.json` (descarga el modelo la 1.ª vez) |

### Cambiar el contenido

1. Edita los archivos de `content/`.
2. Ejecuta `npm run build:brain`.
3. Ejecuta `npm run test`. Los tests comprueban que `brain.json` corresponde al contenido y que cada pregunta preparada recupera los fragmentos que cita su respuesta. Si alguno falla, `npx tsx scripts/inspect.ts` muestra en qué posición queda cada cita.

## Despliegue

Cada push a `main` ejecuta `.github/workflows/deploy.yml`, que compila y publica `dist/` en GitHub Pages. En los ajustes del repositorio, Pages debe tener como origen «GitHub Actions».
