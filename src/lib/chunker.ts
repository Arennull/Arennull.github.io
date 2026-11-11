export interface Chunk {
  start: number;
  end: number;
  text: string;
}

/**
 * Fixed-size character chunking that never cuts a word.
 * `size` is the target length in characters, `overlap` a fraction of it (0–0.9)
 * shared between one chunk and the next.
 */
export function chunkText(text: string, size: number, overlap: number): Chunk[] {
  if (size <= 0) throw new Error('size must be positive');
  if (overlap < 0 || overlap >= 1) throw new Error('overlap must be in [0, 1)');

  const chunks: Chunk[] = [];
  const step = Math.max(1, Math.round(size * (1 - overlap)));
  let start = 0;

  while (start < text.length) {
    let end = Math.min(text.length, start + size);
    if (end < text.length) {
      const space = text.lastIndexOf(' ', end);
      if (space > start) end = space;
    }
    chunks.push({ start, end, text: text.slice(start, end) });
    if (end >= text.length) break;

    let next = start + step;
    if (next >= end) next = end;
    // Move to the beginning of a word.
    const space = text.lastIndexOf(' ', next);
    next = space > start ? space + 1 : text[end] === ' ' ? end + 1 : end;
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
