import { MAX_BULLETS, type Slide } from "./slide";

/** After this many "update" responses the current slide is treated as complete. */
export const MAX_UPDATES_PER_SLIDE = 2;

/** True when new speech should start a new slide rather than keep rewriting the current one. */
export function shouldForceNew(slide: Slide | undefined, updates: number): boolean {
  if (!slide) return false;
  return updates >= MAX_UPDATES_PER_SLIDE || slide.bullets.length >= MAX_BULLETS || slide.layout === "quote";
}

const MIN_WORD = 4;

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter((w) => w.length >= MIN_WORD);
}

/** Index of the bullet the presenter is talking about right now (by word overlap with recent speech), or -1. */
export function spokenBulletIndex(bullets: readonly string[], spoken: string, recentWords = 12): number {
  const recent = new Set(words(spoken).slice(-recentWords));
  if (recent.size === 0) return -1;
  let best = -1;
  let bestScore = 0;
  bullets.forEach((b, i) => {
    const w = words(b);
    const score = w.filter((x) => recent.has(x)).length;
    const enough = score >= 2 || (score === 1 && w.length <= 2);
    if (enough && score > bestScore) {
      best = i;
      bestScore = score;
    }
  });
  return best;
}

/**
 * Gives each word of a rolling live caption a stable key so only newly spoken words animate in.
 * `prev` is the previous caption's words and the key of its first word.
 */
export function alignWords(prev: { words: string[]; base: number }, next: string[]): number {
  for (let shift = 0; shift < prev.words.length; shift++) {
    const tail = prev.words.slice(shift);
    const n = Math.min(tail.length, next.length) - 1; // the last word may still be changing
    if (n <= 0) continue;
    let ok = true;
    for (let i = 0; i < n; i++) if (tail[i] !== next[i]) { ok = false; break; }
    if (ok) return prev.base + shift;
  }
  return prev.base + prev.words.length;
}
