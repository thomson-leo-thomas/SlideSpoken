import { z } from "zod";
import { SLIDE_ICONS, toSlideIcon } from "./icons";
import { languageSchema } from "./languages";
import { THEME_NAMES, type ThemeName } from "./themes";

export const MAX_BULLETS = 4;
export const MAX_BULLET_WORDS = 11;

export const LAYOUTS = ["title", "bullets", "quote", "metric", "diagram", "compare"] as const;
export type SlideLayout = (typeof LAYOUTS)[number];

export const DIAGRAMS = ["flow", "steps", "cycle"] as const;
export type DiagramStyle = (typeof DIAGRAMS)[number];

export const DEFAULT_EMOJI = "✨";
const PICTOGRAPHIC = /\p{Extended_Pictographic}/u;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Returns the first emoji in the value, or the default emoji. */
export function toEmoji(value: unknown): string {
  if (typeof value !== "string" || !PICTOGRAPHIC.test(value)) return DEFAULT_EMOJI;
  for (const { segment } of new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value.trim())) {
    if (PICTOGRAPHIC.test(segment)) return segment;
  }
  return DEFAULT_EMOJI;
}

export const slideResponseSchema = z.object({
  action: z.enum(["new", "update"]),
  title: z.string().trim().min(1, "Slide title must not be empty").max(120),
  bullets: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .refine((b) => countWords(b) <= MAX_BULLET_WORDS, `Each bullet must be under ${MAX_BULLET_WORDS + 1} words`),
    )
    .max(MAX_BULLETS),
  layout: z.enum(LAYOUTS),
  icon: z.enum(SLIDE_ICONS),
  emoji: z.string().trim().min(1).max(16).refine((e) => PICTOGRAPHIC.test(e), "emoji must be an emoji"),
  diagram: z.enum(DIAGRAMS).optional(),
  theme: z.enum(THEME_NAMES).optional(),
  imageQuery: z.string().trim().min(1).max(80).optional(),
});

export type SlideResponse = z.infer<typeof slideResponseSchema>;

export interface Slide extends Omit<SlideResponse, "action" | "theme"> {
  id: string;
}

export interface Deck {
  slides: Slide[];
  activeIndex: number;
  theme?: ThemeName;
}

export const EMPTY_DECK: Deck = { slides: [], activeIndex: -1 };

const deckSlideSchema = z.object({
  title: z.string().max(200),
  bullets: z.array(z.string().max(200)).max(MAX_BULLETS),
  layout: z.enum(LAYOUTS),
});

export const MAX_TRANSCRIPT_CHARS = 4000;
export const MAX_DECK_CONTEXT = 20;

export const slideRequestSchema = z.object({
  recentTranscript: z.string().trim().min(1).max(MAX_TRANSCRIPT_CHARS),
  currentDeck: z.object({
    slides: z.array(deckSlideSchema).max(MAX_DECK_CONTEXT),
    activeIndex: z.number().int().min(-1),
    theme: z.enum(THEME_NAMES).optional(),
  }),
  language: languageSchema,
});

export type SlideRequest = z.infer<typeof slideRequestSchema>;

function truncateWords(text: string, max: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length <= max ? words.join(" ") : words.slice(0, max).join(" ");
}

function oneOf<T extends string>(values: readonly T[], value: unknown): T | undefined {
  return values.find((v) => v === value);
}

/** Coerces raw model output toward the schema (trims, caps bullets, maps icon/emoji) before strict validation. */
export function normalizeSlideResponse(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const r = raw as Record<string, unknown>;
  const bullets = Array.isArray(r.bullets)
    ? r.bullets
        .filter((b): b is string => typeof b === "string")
        .map((b) => truncateWords(b, MAX_BULLET_WORDS))
        .filter(Boolean)
        .slice(0, MAX_BULLETS)
    : r.bullets;
  const imageQuery = typeof r.imageQuery === "string" && r.imageQuery.trim() ? r.imageQuery.trim() : undefined;
  return {
    ...r,
    title: typeof r.title === "string" ? r.title.trim() : r.title,
    bullets,
    icon: typeof r.icon === "string" || r.icon == null ? toSlideIcon(r.icon as string | null) : r.icon,
    emoji: toEmoji(r.emoji),
    diagram: oneOf(DIAGRAMS, r.diagram),
    theme: oneOf(THEME_NAMES, r.theme),
    imageQuery,
  };
}

export function parseSlideResponse(raw: unknown) {
  return slideResponseSchema.safeParse(normalizeSlideResponse(raw));
}

/** Compact deck sent to /api/slide as context (most recent slides only). */
export function deckContext(deck: Deck): SlideRequest["currentDeck"] {
  const start = Math.max(0, deck.slides.length - MAX_DECK_CONTEXT);
  return {
    slides: deck.slides.slice(start).map(({ title, bullets, layout }) => ({ title, bullets, layout })),
    activeIndex: deck.activeIndex < 0 ? -1 : Math.max(-1, deck.activeIndex - start),
    ...(deck.theme ? { theme: deck.theme } : {}),
  };
}

/** JSON Schema for OpenAI structured outputs (strict mode: every key required, optional as nullable). */
export const SLIDE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["action", "title", "bullets", "layout", "diagram", "icon", "emoji", "theme", "imageQuery"],
  properties: {
    action: { type: "string", enum: ["new", "update"] },
    title: { type: "string" },
    bullets: { type: "array", items: { type: "string" } },
    layout: { type: "string", enum: [...LAYOUTS] },
    diagram: { anyOf: [{ type: "string", enum: [...DIAGRAMS] }, { type: "null" }] },
    icon: { type: "string", enum: [...SLIDE_ICONS] },
    emoji: { type: "string" },
    theme: { type: "string", enum: [...THEME_NAMES] },
    imageQuery: { type: ["string", "null"] },
  },
} as const;
