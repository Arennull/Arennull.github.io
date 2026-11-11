/** Prints, for every prepared query, where its cited fragments land. Dev aid for content edits. */
import { embeddedQueries, retrieve } from '../src/lib/brain';

for (const { query, vec } of embeddedQueries) {
  for (const lang of ['en', 'es'] as const) {
    const r = retrieve(vec, query.question[lang], lang);
    const place = (list: typeof r.fused, id: string) =>
      list.findIndex((s) => s.item.node.id === id) + 1 || '-';
    const cites = query.cites
      .map((c) => `${c} v${place(r.vector, c)} l${place(r.lexical, c)} f${place(r.fused, c)}`)
      .join(' | ');
    console.log(`${query.id} ${lang}: ${cites}`);
    console.log(
      `    fused: ${r.fused
        .slice(0, 5)
        .map((s) => s.item.node.id)
        .join(' ')}`,
    );
  }
}
