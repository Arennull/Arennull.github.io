import { describe, expect, it } from 'vitest';
import { ENEMIES, HERO } from './sprite-data';

describe('sprites', () => {
  it.each(Object.entries({ hero: HERO, ...ENEMIES }))('%s is a clean grid', (_, sprite) => {
    const width = sprite.rows[0]!.length;
    for (const row of sprite.rows) {
      expect(row).toHaveLength(width);
      for (const cell of row) {
        if (cell !== '.') expect(sprite.colors).toHaveProperty(cell);
      }
    }
  });
});
