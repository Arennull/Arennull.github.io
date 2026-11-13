# Portfolio de Alejandro Tiscar

Web personal publicada en <https://arennull.github.io>, planteada como un pequeño RPG: el mapa es una ciudad cyberpunk japonesa en 3D donde cada torre es un fragmento de conocimiento, colocado según sus embeddings reales. El visitante viaja de torre en torre, pregunta al Oráculo, gana combates y sube de nivel.

## Qué hay dentro

- **Pantalla de título** con nueva partida, continuar, sonido e idioma.
- **Mapa** (Three.js con React Three Fiber, renderizado en píxeles): ciudad generada por código, con rascacielos de ventanas encendidas, carteles de neón con kanji, autopista elevada, tráfico, coches voladores, torii y lluvia. Cada fragmento ocupa la parcela más cercana a la proyección UMAP de su embedding, es más alto cuantas más conexiones tiene y empieza apagado hasta que se descubre. El héroe va por las calles con las flechas del teclado o con clics. En móvil y equipos modestos la escena se aligera sola.
- **Oráculo**: para cada pregunta se calcula en el navegador la búsqueda vectorial (coseno), la búsqueda por palabras (BM25) y su fusión por rango recíproco. Solo la redacción de la respuesta está escrita de antemano. También admite texto libre (sin modelo en el navegador: los mejores aciertos por palabras prestan sus vectores a la consulta), enseña por dentro la posición de cada fragmento en cada lista y ejecuta en vivo una evaluación de recall y MRR de la propia web.
- **Combates** por turnos en un dojo, sin preguntas: el samurái elige entre cuatro técnicas (cada enemigo es débil a una), ponerse en guardia, beber té o huir. Tres guardianes y un jefe final, la Alucinación. Aparte hay un **entrenamiento** opcional con tres minijuegos sobre los embeddings reales («Sé el retriever», «Chunking lab» y «Más cerca o más lejos»).
- **Misiones**: un mapa donde cada proyecto es un lugar en pixel art con su ficha (papel, resultados, herramientas, decisiones y cómo se hizo). **Héroe**: ficha, stack y contacto.
- Progreso con XP, niveles, objetivos y trofeos, guardado en el navegador. Efectos de sonido y música de dojo en los combates, generados por código y apagados por defecto.
- En tres idiomas, cada uno con su dirección: `/` (inglés), `/es/` (español) y `/jp/` (japonés). Sin backend y sin claves. Botón «Saltar al CV» para quien no quiera jugar.

## Cómo funciona

```
content/                 textos: fragmentos, preguntas, juegos y proyectos (en/es)
scripts/build-brain.ts   vectoriza el contenido y escribe src/data/brain.json
src/lib/                 lógica pura con tests: vectores, BM25, RRF, troceado, progreso, combate
src/city/                escena 3D: trazado de la ciudad, decorado y torres
src/games/               minijuegos de entrenamiento
src/ui/                  título, HUD, menú, diálogo, combate, sprites y paneles del juego
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
