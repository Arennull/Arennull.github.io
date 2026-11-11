import { useSyncExternalStore } from 'react';

/** Square-wave sound effects, generated on the fly. Off until the visitor turns them on. */
export type Sfx = 'move' | 'hit' | 'hurt' | 'xp' | 'level' | 'win' | 'lose';

const STORAGE_KEY = 'sound';
const VOLUME = 0.05;

/** Each tune is a list of [frequency in Hz, seconds]. */
const TUNES: Record<Sfx, [number, number][]> = {
  move: [[330, 0.05]],
  hit: [
    [520, 0.05],
    [780, 0.08],
  ],
  hurt: [
    [200, 0.08],
    [130, 0.14],
  ],
  xp: [
    [660, 0.05],
    [880, 0.08],
  ],
  level: [
    [523, 0.09],
    [659, 0.09],
    [784, 0.09],
    [1047, 0.2],
  ],
  win: [
    [523, 0.1],
    [523, 0.1],
    [659, 0.1],
    [784, 0.12],
    [1047, 0.28],
  ],
  lose: [
    [392, 0.16],
    [311, 0.16],
    [233, 0.34],
  ],
};

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

let enabled = read();
let context: AudioContext | null = null;
const listeners = new Set<() => void>();

export function setSound(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    // The choice just will not survive a reload.
  }
  listeners.forEach((listener) => listener());
  if (on) play('xp');
}

export function play(name: Sfx) {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    let at = context.currentTime;
    for (const [frequency, seconds] of TUNES[name]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'square';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(VOLUME, at);
      gain.gain.linearRampToValueAtTime(0, at + seconds);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + seconds);
      at += seconds;
    }
  } catch {
    // No audio device or a blocked context: the game stays silent.
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useSound(): [boolean, (on: boolean) => void] {
  return [useSyncExternalStore(subscribe, () => enabled), setSound];
}
