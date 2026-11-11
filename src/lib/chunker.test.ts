import { describe, expect, it } from 'vitest';
import { chunkText, containsAnswer } from './chunker';

const text = 'one two three four five six seven eight nine ten eleven twelve';

describe('chunkText', () => {
  it('covers the whole text without cutting words', () => {
    const chunks = chunkText(text, 16, 0);
    expect(chunks[0]!.start).toBe(0);
    expect(chunks.at(-1)!.end).toBe(text.length);
    for (const c of chunks) {
      expect(c.text).toBe(text.slice(c.start, c.end));
      expect(c.text.startsWith(' ')).toBe(false);
      expect(c.text.endsWith(' ')).toBe(false);
      expect(c.text.length).toBeLessThanOrEqual(16);
    }
    expect(chunks.map((c) => c.text).join(' ')).toBe(text);
  });

  it('repeats text between neighbours when overlap is set', () => {
    const chunks = chunkText(text, 20, 0.5);
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i]!.start).toBeLessThan(chunks[i - 1]!.end);
      expect(chunks[i]!.start).toBeGreaterThan(chunks[i - 1]!.start);
    }
  });

  it('produces more chunks with overlap than without', () => {
    expect(chunkText(text, 20, 0.5).length).toBeGreaterThan(chunkText(text, 20, 0).length);
  });

  it('returns a single chunk when the text fits', () => {
    expect(chunkText('short text', 100, 0.25)).toEqual([{ start: 0, end: 10, text: 'short text' }]);
  });

  it('loses no character when a word is longer than the chunk', () => {
    const chunks = chunkText('abcdefghij klm', 5, 0);
    expect(chunks.map((c) => c.text).join('')).toBe('abcdefghijklm');
  });

  it('cuts text without spaces at the exact size and still overlaps', () => {
    const text = 'あいうえおかきくけこ'.repeat(5);
    const plain = chunkText(text, 20, 0);
    expect(plain.map((c) => c.text.length)).toEqual([20, 20, 10]);
    const overlapped = chunkText(text, 20, 0.5);
    expect(overlapped.map((c) => c.start)).toEqual([0, 10, 20, 30]);
  });

  it('does not break at a space that belongs to a far-away word', () => {
    const text = `Marta Oyarzun${'は'.repeat(60)}`;
    expect(chunkText(text, 50, 0)[0]!.text).toHaveLength(50);
  });

  it('rejects impossible settings', () => {
    expect(() => chunkText(text, 0, 0)).toThrow();
    expect(() => chunkText(text, 10, 1)).toThrow();
  });
});

describe('containsAnswer', () => {
  it('needs the whole span, not a piece of it', () => {
    const answer = 'three four';
    const [whole] = chunkText(text, 200, 0);
    expect(containsAnswer(whole!, text, answer)).toBe(true);
    const pieces = chunkText(text, 16, 0);
    expect(pieces.some((c) => containsAnswer(c, text, answer))).toBe(false);
  });
});
