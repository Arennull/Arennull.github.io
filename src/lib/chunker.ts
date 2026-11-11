/** No word is longer than this; a space farther back belongs to another word. */
const MAX_WORD = 30;

export interface Chunk {
  start: number;
  end: number;
  text: string;
}

/**
 * Fixed-size character chunking that never cuts a word. Text written without
 * spaces, like Japanese, is cut at the exact character instead.
 * `size` is the target length in characters, `overlap` a fraction of it (0–0.9)
 * shared between one chunk and the next.
 */
export function chunkText(text: string, size: number, overlap: number): Chunk[] {
  if (size <= 0) throw new Error('size must be positive');
  if (overlap < 0 || overlap >= 1) throw new Error('overlap must be in [0, 1)');

  /** A space to break at: the last one before `at`, unless it is too far back to be this word's. */
  const breakBefore = (at: number, min: number) => {
    const space = text.lastIndexOf(' ', at);
    return space > min && at - space <= MAX_WORD ? space : -1;
  };

  const chunks: Chunk[] = [];
  const step = Math.max(1, Math.round(size * (1 - overlap)));
  let start = 0;

  while (start < text.length) {
    let end = Math.min(text.length, start + size);
    if (end < text.length) {
      const space = breakBefore(end, start);
      if (space >= 0) end = space;
    }
    chunks.push({ start, end, text: text.slice(start, end) });
    if (end >= text.length) break;

    let next = Math.min(start + step, end);
    // Move to the beginning of a word.
    const space = breakBefore(next, start);
    if (space >= 0) next = space + 1;
    else if (text[next] === ' ') next += 1;
    start = next;
  }
  return chunks;
}

/** True when the chunk holds the whole answer span, not just a piece of it. */
export function containsAnswer(chunk: Chunk, text: string, answer: string): boolean {
  const at = text.indexOf(answer);
  if (at < 0) return false;
  return chunk.start <= at && chunk.end >= at + answer.length;
}
