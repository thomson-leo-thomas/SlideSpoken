import { detectScriptLanguage } from "./languages";
import { MAX_BULLETS, type SlideRequest } from "./slide";

/** Lowercases and strips punctuation so transcript phrases can be compared. */
export function normalizeText(text: string): string {
  return text.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, " ").trim();
}

const MIN_EVIDENCE_CHARS = 4;
const PARTIAL_MATCH = 0.7;

/** True when the evidence phrase appears in the transcript (verbatim, or mostly verbatim for 2+ words). */
export function evidenceMatches(evidence: string, transcript: string): boolean {
  const e = normalizeText(evidence);
  if (e.length < MIN_EVIDENCE_CHARS) return false;
  const t = normalizeText(transcript);
  if (` ${t} `.includes(` ${e} `)) return true;
  const words = e.split(" ");
  if (words.length < 2) return false;
  const have = new Set(t.split(" "));
  return words.filter((w) => have.has(w)).length / words.length >= PARTIAL_MATCH;
}

function stems(text: string): Set<string> {
  return new Set(
    normalizeText(text)
      .split(" ")
      .filter((w) => w.length >= 3)
      .map((w) => w.slice(0, 4)),
  );
}

/**
 * When text and evidence share a script (no translation involved), they must share at least one word,
 * so a real transcript phrase cannot be attached to an unrelated point.
 */
export function supports(text: string, evidence: string): boolean {
  if (detectScriptLanguage(text) !== detectScriptLanguage(evidence)) return true;
  const e = stems(evidence);
  for (const w of stems(text)) if (e.has(w)) return true;
  return /\p{N}/u.test(text) && /\p{N}/u.test(evidence);
}

const grounded = (text: string, evidence: string, transcript: string) =>
  evidenceMatches(evidence, transcript) && supports(text, evidence);

export type GroundResult = { kind: "skip"; reason: string } | { kind: "slide"; raw: Record<string, unknown>; rejected: number };

function bulletOf(item: unknown): { text: string; evidence: string } {
  if (typeof item === "string") return { text: item, evidence: "" };
  if (!item || typeof item !== "object") return { text: "", evidence: "" };
  const { text, evidence } = item as Record<string, unknown>;
  return { text: typeof text === "string" ? text.trim() : "", evidence: typeof evidence === "string" ? evidence : "" };
}

/**
 * Checks a raw model slide against the current transcript chunk. Bullets without matching evidence are dropped,
 * a title without evidence skips the slide, and "update" keeps the existing bullets and only appends grounded ones.
 */
export function groundSlide(raw: unknown, req: Pick<SlideRequest, "recentTranscript" | "currentDeck">): GroundResult {
  if (!raw || typeof raw !== "object") return { kind: "skip", reason: "invalid model output" };
  const r = raw as Record<string, unknown>;
  if (r.action === "skip") return { kind: "skip", reason: "nothing slide-worthy in this chunk" };

  const { slides, activeIndex } = req.currentDeck;
  const current = r.action === "update" && activeIndex >= 0 ? slides[activeIndex] : undefined;
  const transcript = req.recentTranscript;
  let title = typeof r.title === "string" ? r.title.trim() : "";
  const titleEvidence = typeof r.titleEvidence === "string" ? r.titleEvidence : "";
  const titleOk = !!title && grounded(title, titleEvidence, transcript);
  if (current && !titleOk) title = current.title; // an update keeps its title unless the new one is grounded
  const keepsTitle = !!current && normalizeText(title) === normalizeText(current.title);

  const bullets = current ? [...current.bullets] : [];
  // Points already shown on other slides are never repeated.
  const seen = new Set([...slides.flatMap((s) => s.bullets), ...bullets].map(normalizeText));
  let rejected = 0;
  for (const item of Array.isArray(r.bullets) ? r.bullets : []) {
    const { text, evidence } = bulletOf(item);
    const key = normalizeText(text);
    if (!key || seen.has(key)) continue;
    if (!grounded(text, evidence, transcript)) {
      if (!current) rejected++;
      continue;
    }
    seen.add(key);
    bullets.push(text);
  }
  let kept = bullets.slice(0, MAX_BULLETS);
  if (!current && !titleOk) {
    // A new slide whose title isn't grounded uses its first grounded point as the title instead.
    if (kept.length === 0) return { kind: "skip", reason: "nothing supported by the transcript" };
    [title, ...kept] = kept;
  }
  if (current && keepsTitle && kept.length === current.bullets.length) return { kind: "skip", reason: "nothing new" };

  let layout = r.layout;
  if (layout === "compare" && (kept.length < 2 || kept.length % 2 !== 0)) layout = "bullets";
  if (layout === "diagram" && kept.length < 2) layout = "bullets";
  if (layout === "bullets" && kept.length === 0) layout = "title";
  if (layout === "title" && kept.length >= 2) layout = "bullets";

  const out: Record<string, unknown> = { ...r, layout, bullets: kept, title };
  delete out.titleEvidence;
  return { kind: "slide", raw: out, rejected };
}
