import { describe, expect, it } from "vitest";
import { deckContext, normalizeSlideResponse, parseSlideResponse, slideRequestSchema, slideResponseSchema, toEmoji, type Deck } from "./slide";

const valid = {
  action: "new",
  title: "Solar energy in Kerala",
  bullets: ["Rooftop panels doubled since 2020", "Cheaper than grid power"],
  layout: "bullets",
  icon: "Sun",
  emoji: "☀️",
  imageQuery: "solar panels roof",
};

describe("slideResponseSchema", () => {
  it("accepts a valid slide", () => {
    expect(slideResponseSchema.safeParse(valid).success).toBe(true);
  });
  it("accepts a slide without imageQuery and with no bullets", () => {
    const { imageQuery: _omit, ...rest } = valid;
    void _omit;
    expect(slideResponseSchema.safeParse({ ...rest, bullets: [] }).success).toBe(true);
  });
  it("accepts Malayalam and Hindi text", () => {
    expect(slideResponseSchema.safeParse({ ...valid, title: "കേരളത്തിലെ സൗരോർജ്ജം", bullets: ["വീടുകളിൽ സോളാർ പാനലുകൾ"] }).success).toBe(true);
    expect(slideResponseSchema.safeParse({ ...valid, title: "भारत में सौर ऊर्जा", bullets: ["घरों पर सोलर पैनल"] }).success).toBe(true);
  });
  it("rejects an empty title", () => {
    expect(slideResponseSchema.safeParse({ ...valid, title: "   " }).success).toBe(false);
  });
  it("rejects more than 4 bullets", () => {
    expect(slideResponseSchema.safeParse({ ...valid, bullets: ["a", "b", "c", "d", "e"] }).success).toBe(false);
  });
  it("rejects bullets of 12 or more words", () => {
    const long = "one two three four five six seven eight nine ten eleven twelve";
    expect(slideResponseSchema.safeParse({ ...valid, bullets: [long] }).success).toBe(false);
  });
  it("rejects unknown layouts, actions and icons", () => {
    expect(slideResponseSchema.safeParse({ ...valid, layout: "table" }).success).toBe(false);
    expect(slideResponseSchema.safeParse({ ...valid, action: "delete" }).success).toBe(false);
    expect(slideResponseSchema.safeParse({ ...valid, icon: "NotAnIcon" }).success).toBe(false);
  });
});

describe("normalizeSlideResponse / parseSlideResponse", () => {
  it("caps bullets, truncates long bullets, maps icons and drops null imageQuery", () => {
    const raw = {
      ...valid,
      title: "  Padded title  ",
      bullets: ["one two three four five six seven eight nine ten eleven twelve thirteen", "b", "c", "d", "e"],
      icon: "trending-up",
      imageQuery: null,
    };
    const result = parseSlideResponse(raw);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.title).toBe("Padded title");
    expect(result.data.bullets).toHaveLength(4);
    expect(result.data.bullets[0].split(" ")).toHaveLength(11);
    expect(result.data.icon).toBe("TrendingUp");
    expect(result.data.imageQuery).toBeUndefined();
  });
  it("falls back to the default icon for unknown names", () => {
    expect((normalizeSlideResponse({ ...valid, icon: "Unicorn" }) as { icon: string }).icon).toBe("Sparkles");
  });
  it("still rejects an empty slide after normalizing", () => {
    expect(parseSlideResponse({ ...valid, title: "", bullets: [] }).success).toBe(false);
  });
  it("rejects non-object input", () => {
    expect(parseSlideResponse(null).success).toBe(false);
    expect(parseSlideResponse("slide").success).toBe(false);
  });
});

describe("slideRequestSchema", () => {
  const request = { recentTranscript: "hello", currentDeck: { slides: [], activeIndex: -1 }, language: "ml" };
  it("accepts a valid request", () => {
    expect(slideRequestSchema.safeParse(request).success).toBe(true);
  });
  it("rejects empty transcript and unsupported language", () => {
    expect(slideRequestSchema.safeParse({ ...request, recentTranscript: " " }).success).toBe(false);
    expect(slideRequestSchema.safeParse({ ...request, language: "ta" }).success).toBe(false);
  });
});

describe("deckContext", () => {
  it("keeps the last 20 slides and re-bases the active index", () => {
    const slides = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      title: `Slide ${i}`,
      bullets: [],
      layout: "bullets" as const,
      icon: "Sparkles" as const,
      emoji: "✨",
    }));
    const deck: Deck = { slides, activeIndex: 24 };
    const ctx = deckContext(deck);
    expect(ctx.slides).toHaveLength(20);
    expect(ctx.slides[0].title).toBe("Slide 5");
    expect(ctx.activeIndex).toBe(19);
    expect(ctx.slides[0]).not.toHaveProperty("id");
  });
});

describe("emoji, theme and diagram fields", () => {
  it("extracts the first emoji and falls back to a default", () => {
    expect(toEmoji("🚀 launch")).toBe("🚀");
    expect(toEmoji("👩‍🏫")).toBe("👩‍🏫");
    expect(toEmoji("rocket")).toBe("✨");
    expect(toEmoji(null)).toBe("✨");
  });
  it("normalizes nullable model fields and accepts the compare layout", () => {
    const parsed = parseSlideResponse({ ...valid, layout: "compare", emoji: "nope", diagram: null, theme: "neon" });
    expect(parsed.success).toBe(true);
    expect(parsed.data).toMatchObject({ layout: "compare", emoji: "✨", theme: "neon" });
    expect(parsed.data?.diagram).toBeUndefined();
  });
  it("drops unknown themes and diagram styles", () => {
    const parsed = parseSlideResponse({ ...valid, layout: "diagram", diagram: "spiral", theme: "rainbow" });
    expect(parsed.success).toBe(true);
    expect(parsed.data?.theme).toBeUndefined();
    expect(parsed.data?.diagram).toBeUndefined();
  });
  it("rejects a non-emoji in strict validation", () => {
    expect(slideResponseSchema.safeParse({ ...valid, emoji: "abc" }).success).toBe(false);
  });
  it("sends the deck theme as context", () => {
    expect(deckContext({ slides: [], activeIndex: -1, theme: "paper" }).theme).toBe("paper");
  });
});
