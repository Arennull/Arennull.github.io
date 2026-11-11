import type { BattleId } from '../lib/progress';

/** Pixel art as text: one character per pixel, '.' is transparent. */
export interface SpriteData {
  rows: string[];
  colors: Record<string, string>;
}

/** A small samurai in the colours of my avatar: green armour, bone-coloured crest and mask. */
export const HERO: SpriteData = {
  rows: [
    '.y........y.',
    '.yy......yy.',
    '..yyrrrryy..',
    '..rrryyrrr..',
    'rrrrrrrrrrrr',
    '.rrssssssrr.',
    '..rsessesr.w',
    '...ssssss..w',
    '..rrryyrrr.w',
    '.rrryrryrr.w',
    '.srrryyrrrsy',
    '..rrrrrrrr.o',
    '..bbb..bbb..',
    '..ooo..ooo..',
  ],
  colors: {
    y: '#dcc8a0',
    r: '#2e6b5e',
    s: '#dcc8a0',
    e: '#1a1c2c',
    w: '#f4f4f4',
    b: '#1f4a44',
    o: '#b8a47c',
  },
};

/** The same samurai mid-strike: the katana swung level, four pixels past the body. */
export const HERO_ATTACK: SpriteData = {
  rows: HERO.rows.map((row, y) => {
    // Rows 6 to 11 hold the upright katana of the resting pose.
    const body = y >= 6 && y <= 11 ? `${row.slice(0, 11)}.` : row;
    if (y === 9) return `${body.slice(0, 10)}syowww`;
    if (y === 10) return `${body.slice(0, 10)}r.....`;
    return `${body}....`;
  }),
  colors: HERO.colors,
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

const C = {
  n: '#1a1c2c',
  r: '#b13e53',
  o: '#ef7d57',
  y: '#ffcd75',
  g: '#a7f070',
  G: '#38b764',
  c: '#41a6f6',
  w: '#f4f4f4',
  s: '#94b0c2',
  S: '#566c86',
};

/** One landmark per project on the quest map, keyed by project id. */
export const LANDMARKS: Record<string, SpriteData> = {
  // A sneaker.
  sangi: {
    rows: [
      '............',
      '............',
      '...oooo.....',
      '...oooo.....',
      '...owwoo....',
      '...oowwoo...',
      '...ooowwooo.',
      '..oooooooooo',
      '..oooooooooo',
      '..wwwwwwwwww',
      '..wwwwwwwwww',
      '............',
    ],
    colors: C,
  },
  // A dumbbell.
  jairofitness: {
    rows: [
      '............',
      '............',
      '.ss......ss.',
      '.ss......ss.',
      'sss......sss',
      'sssyyyyyysss',
      'sssyyyyyysss',
      'sss......sss',
      '.ss......ss.',
      '.ss......ss.',
      '............',
      '............',
    ],
    colors: C,
  },
  // A scroll.
  'market-movers': {
    rows: [
      '............',
      '.yyyyyyyyyy.',
      '.yooooooooy.',
      '..wwwwwwww..',
      '..wnnnnnww..',
      '..wwwwwwww..',
      '..wnnnwwww..',
      '..wwwwwwww..',
      '..wnnnnnww..',
      '..wwwwwwww..',
      '.yooooooooy.',
      '.yyyyyyyyyy.',
    ],
    colors: C,
  },
  // A ball.
  proyectasport: {
    rows: [
      '............',
      '....wwww....',
      '..wwwnnwww..',
      '..wwnnnnww..',
      '.wwwwnnwwww.',
      '.nwwwwwwwwn.',
      '.nnwwwwwwnn.',
      '.nwwwnnwwwn.',
      '..wwnnnnww..',
      '..wwwnnwww..',
      '....wwww....',
      '............',
    ],
    colors: C,
  },
  // An hourglass.
  catalyst: {
    rows: [
      '............',
      '..yyyyyyyy..',
      '...wccccw...',
      '...wccccw...',
      '....wccw....',
      '.....wc.....',
      '.....cw.....',
      '....w.cw....',
      '...w.cc.w...',
      '...wccccw...',
      '..yyyyyyyy..',
      '............',
    ],
    colors: C,
  },
  // A keep.
  'private-equity': {
    rows: [
      '............',
      '.s.ss.ss.ss.',
      '.ssssssssss.',
      '.ssssssssss.',
      '..ssssssss..',
      '..ssnssnss..',
      '..ssssssss..',
      '..ssssssss..',
      '..sssnnsss..',
      '..sssnnsss..',
      '.ssssnnssss.',
      '............',
    ],
    colors: C,
  },
  abacus: {
    rows: [
      '............',
      'oooooooooooo',
      'o..........o',
      'orrSyySSgg.o',
      'o..........o',
      'o.rryySggS.o',
      'o..........o',
      'orSyyggSSr.o',
      'o..........o',
      'oooooooooooo',
      '............',
      '............',
    ],
    colors: C,
  },
  // A car.
  pitlane: {
    rows: [
      '............',
      '............',
      '............',
      '...rrrrrr...',
      '..rrccrccr..',
      '.rrrccrccrr.',
      'rrrrrrrrrrrr',
      'rrrrrrrrrrry',
      'rSSrrrrrSSrr',
      '.SS.....SS..',
      '............',
      '............',
    ],
    colors: C,
  },
  // A house.
  showhome: {
    rows: [
      '............',
      '.....rr.....',
      '....rrrr....',
      '...rrrrrr...',
      '..rrrrrrrr..',
      '.rrrrrrrrrr.',
      '..wwwwwwww..',
      '..wccwwwww..',
      '..wccwwoow..',
      '..wwwwwoow..',
      '..wwwwwoow..',
      '............',
    ],
    colors: C,
  },
  // An anvil.
  pitchsmith: {
    rows: [
      '............',
      '.....y......',
      '...y...y....',
      '............',
      '.sssssssssss',
      '...sssssssss',
      '....ssssss..',
      '.....ssss...',
      '.....ssss...',
      '....ssssss..',
      '...ssssssss.',
      '............',
    ],
    colors: C,
  },
  kettlebell: {
    rows: [
      '............',
      '....ssss....',
      '...ss..ss...',
      '...s....s...',
      '...ss..ss...',
      '...SSSSSS...',
      '..SSSSSSSS..',
      '.SSwSSSSSSS.',
      '.SwSSSSSSSS.',
      '.SSSSSSSSSS.',
      '..SSSSSSSS..',
      '............',
    ],
    colors: C,
  },
  // A potion.
  apothecary: {
    rows: [
      '............',
      '.....oo.....',
      '....yyyy....',
      '.....ww.....',
      '.....ww.....',
      '....wwww....',
      '...wGGGGw...',
      '..wGGgGGGw..',
      '..wGgGGGGw..',
      '..wGGGGGGw..',
      '...wwwwww...',
      '............',
    ],
    colors: C,
  },
  signpost: {
    rows: [
      '............',
      '.....oo.....',
      '.yyyyyyyyy..',
      '.yyyyyyyyyy.',
      '.yyyyyyyyy..',
      '.....oo.....',
      '..yyyyyyyyy.',
      '.yyyyyyyyyy.',
      '..yyyyyyyyy.',
      '.....oo.....',
      '.....oo.....',
      '....GGGG....',
    ],
    colors: C,
  },
};
