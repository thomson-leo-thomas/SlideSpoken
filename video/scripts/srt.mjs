// Prints SRT subtitles that match the voice-over timing used in src/timeline.ts.
import { readFileSync } from "node:fs";
import { LINES } from "./voiceover-lines.mjs";

const FPS = 30, TRANSITION = 12, VO_LEAD = 8;
const MIN = [90, 150, 150, 360, 240, 210, 150];
const vo = JSON.parse(readFileSync(new URL("../public/audio/durations.json", import.meta.url))).vo;
const scenes = MIN.map((m, i) => Math.max(m, Math.ceil((vo[i] + 0.5) * FPS) + VO_LEAD + TRANSITION));
const starts = scenes.map((_, i) => scenes.slice(0, i).reduce((a, b) => a + b, 0) - i * TRANSITION);
const voStarts = starts.map((s, i) => (s + (i === 0 ? 6 : VO_LEAD + TRANSITION / 2)) / FPS);
const ts = (t) => {
  const ms = Math.round(t * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};
console.log(LINES.map((l, i) => `${i + 1}\n${ts(voStarts[i])} --> ${ts(voStarts[i] + vo[i])}\n${l}\n`).join("\n"));
