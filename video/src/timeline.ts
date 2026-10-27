import durations from "../public/audio/durations.json";
import { LINES } from "../scripts/voiceover-lines.mjs";

export const FPS = 30;
export const TRANSITION = 12;
/** Minimum scene lengths in frames: hook, problem, intro, features, how it works, payoff, end. */
const MIN = [90, 150, 150, 360, 240, 210, 150];
const VO_LEAD = 8;

export const VO_SECONDS: number[] = durations.vo;
export const SCENES = MIN.map((m, i) => Math.max(m, Math.ceil((VO_SECONDS[i] + 0.5) * FPS) + VO_LEAD + TRANSITION));
export const STARTS = SCENES.map((_, i) => SCENES.slice(0, i).reduce((a, b) => a + b, 0) - i * TRANSITION);
export const TOTAL = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1];
/** Absolute frame where each voice-over line starts. */
export const VO_STARTS = STARTS.map((s, i) => s + (i === 0 ? 6 : VO_LEAD + TRANSITION / 2));
export const CAPTIONS: string[] = LINES;
