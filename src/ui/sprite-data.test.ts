import { describe, expect, it } from 'vitest';
import { projects } from '../../content/projects';
import { ENEMIES, HERO, LANDMARKS } from './sprite-data';

describe('sprites', () => {
  it.each(Object.entries({ hero: HERO, ...ENEMIES, ...LANDMARKS }))(
    '%s is a clean grid',
    (_, sprite) => {
      const width = sprite.rows[0]!.length;
      for (const row of sprite.rows) {
        expect(row).toHaveLength(width);
        for (const cell of row) {
          if (cell !== '.') expect(sprite.colors).toHaveProperty(cell);
        }
      }
    },
  );

  it('every project has its landmark on the quest map', () => {
    expect(Object.keys(LANDMARKS).sort()).toEqual(projects.map((p) => p.id).sort());
  });
});
