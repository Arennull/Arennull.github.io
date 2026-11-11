import type { BattleId } from '../lib/progress';

/** Pixel art as text: one character per pixel, '.' is transparent. */
export interface SpriteData {
  rows: string[];
  colors: Record<string, string>;
}

/** A hooded scholar. */
export const HERO: SpriteData = {
  rows: [
    '....hhhh....',
    '...hhhhhh...',
    '..hhhhhhhh..',
    '..hssssssh..',
    '..hsesseSh..',
    '..hssssssh..',
    '...hssssh...',
    '..rrrrrrrr..',
    '.rrrryyrrrr.',
    '.rrrryyrrrr.',
    '.srrrrrrrrs.',
    '..rrrrrrrr..',
    '..rrr..rrr..',
    '..bbb..bbb..',
  ],
  colors: {
    h: '#3b5dc9',
    s: '#ffcd75',
    S: '#ffcd75',
    e: '#1a1c2c',
    r: '#29366f',
    y: '#ffcd75',
    b: '#333c57',
  },
};

export const ENEMIES: Record<BattleId, SpriteData> = {
  // Lost Query: a ghost that never found its answer.
  retriever: {
    rows: [
      '...wwwwww...',
      '..wwwwwwww..',
      '.wwwwwwwwww.',
      '.wweewweeww.',
      '.wweewweeww.',
      '.wwwwwwwwww.',
      '.wwwwccwwww.',
      '.wwwwwwwwww.',
      '.wwwwwwwwww.',
      '.wwwwwwwwww.',
      '.ww.www.www.',
      '.w...w...ww.',
    ],
    colors: { w: '#f4f4f4', e: '#1a1c2c', c: '#41a6f6' },
  },
  // The Shredder: cuts every text it finds.
  chunking: {
    rows: [
      '.rr......rr.',
      '.rrr....rrr.',
      '..rrrrrrrr..',
      '.rrrrrrrrrr.',
      '.rwnrrrrwnr.',
      '.rrrrrrrrrr.',
      '.rwnwnwnwnr.',
      '.rnnnnnnnnr.',
      '.rnwnwnwnwr.',
      '.rrrrrrrrrr.',
      '..oo....oo..',
      '..oo....oo..',
    ],
    colors: { r: '#b13e53', w: '#f4f4f4', n: '#1a1c2c', o: '#ef7d57' },
  },
  // The Mimic: two shapes that look the same and are not.
  closer: {
    rows: [
      '............',
      '..cc....oo..',
      '.cccc..oooo.',
      'ccccccoooooo',
      'cnccnconoono',
      'ccccccoooooo',
      'cwwwwcowwwwo',
      'ccccccoooooo',
      '.cccc..oooo.',
      '..cc....oo..',
    ],
    colors: { c: '#73eff7', o: '#ef7d57', n: '#1a1c2c', w: '#f4f4f4' },
  },
  // The Hallucination: many eyes, no sources.
  boss: {
    rows: [
      '....pppppppp....',
      '..pppppppppppp..',
      '.ppyyppppppyypp.',
      '.ppynppyyppnypp.',
      'pppyyppynppyyppp',
      'pppppppyyppppppp',
      'pppppppppppppppp',
      'ppprrrrrrrrrrppp',
      'pprwnwnwnwnwnrpp',
      'pprnnnnnnnnnnrpp',
      'pprnwnwnwnwnwrpp',
      'ppprrrrrrrrrrppp',
      '.pppppppppppppp.',
      '.ppp.pppppp.ppp.',
      '.pp...pppp...pp.',
      '..p....pp....p..',
    ],
    colors: { p: '#5d275d', y: '#ffcd75', n: '#1a1c2c', r: '#b13e53', w: '#f4f4f4' },
  },
};
