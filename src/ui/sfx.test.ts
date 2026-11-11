import { describe, expect, it } from 'vitest';
import { DOJO_TUNE } from './sfx';

describe('dojo music', () => {
  it('loops on whole bars', () => {
    expect(DOJO_TUNE.melody.length % DOJO_TUNE.bar).toBe(0);
    for (const step of [...DOJO_TUNE.drone, ...DOJO_TUNE.drum]) {
      expect(step).toBeLessThan(DOJO_TUNE.bar);
    }
  });

  it('stays on its five-note scale, within the octave it was written for', () => {
    const scale = [293.66, 329.63, 349.23, 440, 466.16, 587.33];
    for (const note of DOJO_TUNE.melody) {
      if (note !== 0) expect(scale).toContain(note);
    }
  });

  it('opens every bar with a note, so the loop never starts on silence', () => {
    for (let bar = 0; bar < DOJO_TUNE.melody.length; bar += DOJO_TUNE.bar) {
      expect(DOJO_TUNE.melody[bar]).toBeGreaterThan(0);
    }
  });
});
