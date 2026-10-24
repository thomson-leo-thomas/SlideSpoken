import { MAX_BULLET_WORDS, MAX_BULLETS, type SlideResponse } from "./slide";

const TITLE_WORDS = 6;

/** Builds a plain bullet slide from raw transcript text, used when the LLM is unavailable. */
export function fallbackSlide(transcript: string): SlideResponse | null {
  const words = transcript.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length === 0) return null;

  const sentences = transcript
    .split(/(?<=[.!?।])\s+/)
    .map((s) => s.trim().replace(/[.!?।]+$/, ""))
    .filter(Boolean);

  const title = words.slice(0, TITLE_WORDS).join(" ").replace(/[.,!?।]+$/, "") + (words.length > TITLE_WORDS ? "…" : "");

  const bullets: string[] = [];
  for (const sentence of sentences.length ? sentences : [words.join(" ")]) {
    const sw = sentence.split(/\s+/).filter(Boolean);
    for (let i = 0; i < sw.length && bullets.length < MAX_BULLETS; i += MAX_BULLET_WORDS) {
      bullets.push(sw.slice(i, i + MAX_BULLET_WORDS).join(" "));
    }
    if (bullets.length >= MAX_BULLETS) break;
  }

  return { action: "new", title, bullets: words.length > TITLE_WORDS ? bullets : [], layout: "bullets", icon: "MessageSquare", emoji: "💬" };
}
