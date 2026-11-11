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
  if (on) {
    play('xp');
    if (wanted) beginMusic();
  } else {
    endMusic();
  }
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

/**
 * Battle music, also generated: a plucked melody on a Japanese five-note scale
 * (D, E, F, A, B flat) over a low drone and a slow drum. Each step is an eighth note.
 */
const D3 = 146.83;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const A4 = 440;
const Bb4 = 466.16;
const D5 = 587.33;
const __ = 0;

export const DOJO_TUNE = {
  melody: [
    [D5, __, A4, Bb4, A4, __, F4, __, E4, F4, A4, __, D4, __, __, __],
    [A4, __, Bb4, A4, F4, E4, D4, __, E4, __, F4, __, A4, __, __, __],
    [D5, __, A4, Bb4, A4, __, F4, __, E4, F4, A4, __, D4, __, __, __],
    [F4, E4, D4, __, E4, __, A4, __, Bb4, A4, F4, __, D4, __, __, __],
  ].flat(),
  /** Steps of each bar where the drone and the drum sound. */
  drone: [0, 8],
  drum: [0, 6, 8, 12],
  bar: 16,
};

const MUSIC_VOLUME = 0.04;
const STEP_SECONDS = 0.3;
const FAST_STEP_SECONDS = 0.23;
/** How far ahead notes are queued, so a busy page does not make the music stutter. */
const LOOKAHEAD_SECONDS = 0.3;

let wanted: { fast: boolean } | null = null;
let music: { timer: ReturnType<typeof setInterval>; out: GainNode } | null = null;

/** A koto-like pluck: sharp attack, quick decay, a little brightness filtered off. */
function pluck(ctx: AudioContext, out: AudioNode, frequency: number, at: number, level: number) {
  const oscillator = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  oscillator.type = 'sawtooth';
  oscillator.frequency.value = frequency;
  filter.type = 'lowpass';
  filter.frequency.value = frequency * 4;
  gain.gain.setValueAtTime(level, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.7);
  oscillator.connect(filter).connect(gain).connect(out);
  oscillator.start(at);
  oscillator.stop(at + 0.75);
}

/** A taiko-like thump: a low tone whose pitch drops as it fades. */
function drum(ctx: AudioContext, out: AudioNode, at: number, level: number) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(110, at);
  oscillator.frequency.exponentialRampToValueAtTime(45, at + 0.18);
  gain.gain.setValueAtTime(level, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.25);
  oscillator.connect(gain).connect(out);
  oscillator.start(at);
  oscillator.stop(at + 0.3);
}

function beginMusic() {
  if (music || !wanted || !enabled) return;
  try {
    context ??= new AudioContext();
    const ctx = context;
    if (ctx.state === 'suspended') void ctx.resume();
    const out = ctx.createGain();
    out.gain.value = MUSIC_VOLUME;
    out.connect(ctx.destination);
    const seconds = wanted.fast ? FAST_STEP_SECONDS : STEP_SECONDS;
    let step = 0;
    let at = ctx.currentTime + 0.1;
    const queue = () => {
      while (at < ctx.currentTime + LOOKAHEAD_SECONDS) {
        const inBar = step % DOJO_TUNE.bar;
        const note = DOJO_TUNE.melody[step % DOJO_TUNE.melody.length]!;
        if (note) pluck(ctx, out, note, at, 1);
        if (DOJO_TUNE.drone.includes(inBar)) pluck(ctx, out, D3, at, 0.8);
        if (DOJO_TUNE.drum.includes(inBar)) drum(ctx, out, at, inBar === 0 ? 1.6 : 1);
        step += 1;
        at += seconds;
      }
    };
    queue();
    music = { timer: setInterval(queue, 100), out };
  } catch {
    // No audio device or a blocked context: the fight goes on in silence.
  }
}

function endMusic() {
  if (!music) return;
  clearInterval(music.timer);
  const { out } = music;
  music = null;
  try {
    out.gain.setTargetAtTime(0, context!.currentTime, 0.08);
    setTimeout(() => out.disconnect(), 600);
  } catch {
    // Already gone.
  }
}

/** Battle music plays while a fight is on and sound is enabled. */
export function startMusic(fast = false) {
  wanted = { fast };
  beginMusic();
}

export function stopMusic() {
  wanted = null;
  endMusic();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useSound(): [boolean, (on: boolean) => void] {
  return [useSyncExternalStore(subscribe, () => enabled), setSound];
}
