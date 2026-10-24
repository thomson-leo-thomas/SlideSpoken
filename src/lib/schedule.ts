import { countWords } from "./slide";

/** Chunks with fewer words are carried into the next chunk instead of becoming a slide on their own. */
export const MIN_CHUNK_WORDS = 6;
/** A slide stays on screen at least this long before the next one replaces it. */
export const MIN_DISPLAY_MS = 3000;

export interface ScheduleState {
  pendingText: string;
  inFlight: boolean;
  listening: boolean;
}

/** Request a slide once a chunk brings enough new words, or flush whatever is left when listening stops. */
export function shouldRequestSlide(s: ScheduleState): boolean {
  if (s.inFlight || !s.pendingText.trim()) return false;
  return !s.listening || countWords(s.pendingText) >= MIN_CHUNK_WORDS;
}

/** How long to hold a ready slide so the current one has been visible for MIN_DISPLAY_MS. */
export function displayDelay(now: number, lastShownAt: number | null): number {
  return lastShownAt === null ? 0 : Math.max(0, MIN_DISPLAY_MS - (now - lastShownAt));
}
