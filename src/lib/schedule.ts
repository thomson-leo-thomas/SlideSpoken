export const SLIDE_INTERVAL_MS = 6_000;
export const PAUSE_MS = 1_000;

export interface ScheduleState {
  pendingText: string;
  inFlight: boolean;
  listening: boolean;
  now: number;
  lastRequestAt: number | null;
  lastSegmentAt: number | null;
}

/** Request a slide for new text every ~6s, shortly after a speech pause, or when listening stops. */
export function shouldRequestSlide(s: ScheduleState): boolean {
  if (s.inFlight || !s.pendingText.trim()) return false;
  if (!s.listening) return true;
  if (s.lastRequestAt === null) return true;
  if (s.now - s.lastRequestAt >= SLIDE_INTERVAL_MS) return true;
  return s.lastSegmentAt !== null && s.now - s.lastSegmentAt >= PAUSE_MS;
}
