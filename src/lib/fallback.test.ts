import { describe, expect, it } from "vitest";
import { fallbackSlide } from "./fallback";
import { slideResponseSchema } from "./slide";

describe("fallbackSlide", () => {
  it("returns null for empty text", () => {
    expect(fallbackSlide("   ")).toBeNull();
  });
  it("builds a valid bullet slide from raw transcript", () => {
    const slide = fallbackSlide(
      "Solar power is now cheaper than coal in most of India. Kerala has added thousands of rooftop systems. Batteries are the next big step for homes and schools across the state.",
    );
    expect(slide).not.toBeNull();
    expect(slideResponseSchema.safeParse(slide).success).toBe(true);
    expect(slide!.layout).toBe("bullets");
    expect(slide!.title).toBe("Solar power is now cheaper than…");
    expect(slide!.bullets.length).toBeGreaterThan(0);
    expect(slide!.bullets.length).toBeLessThanOrEqual(4);
  });
  it("uses short text as the title only", () => {
    expect(fallbackSlide("Hello everyone")).toMatchObject({ title: "Hello everyone", bullets: [] });
  });
  it("handles Malayalam and very long unpunctuated speech", () => {
    const ml = fallbackSlide("ഇന്ന് നമ്മൾ കേരളത്തിലെ സൗരോർജ്ജത്തെക്കുറിച്ച് സംസാരിക്കാൻ പോകുന്നു");
    expect(slideResponseSchema.safeParse(ml).success).toBe(true);
    const long = fallbackSlide(Array.from({ length: 80 }, (_, i) => `word${i}`).join(" "));
    expect(slideResponseSchema.safeParse(long).success).toBe(true);
    expect(long!.bullets).toHaveLength(4);
  });
});
