import { describe, expect, it } from "vitest";
import { alignWords, MAX_UPDATES_PER_SLIDE, shouldForceNew, spokenBulletIndex } from "./live";
import type { Slide } from "./slide";

const slide = (bullets: string[], layout: Slide["layout"] = "bullets"): Slide => ({
  id: "s",
  title: "T",
  bullets,
  layout,
  icon: "Sparkles",
  emoji: "✨",
});

describe("shouldForceNew", () => {
  it("is false for an empty deck or a fresh slide", () => {
    expect(shouldForceNew(undefined, 5)).toBe(false);
    expect(shouldForceNew(slide(["a"]), 0)).toBe(false);
  });
  it("starts a new slide once the current one is full, updated enough, or a quote", () => {
    expect(shouldForceNew(slide(["a"]), MAX_UPDATES_PER_SLIDE)).toBe(true);
    expect(shouldForceNew(slide(["a", "b", "c", "d"]), 0)).toBe(true);
    expect(shouldForceNew(slide([], "quote"), 0)).toBe(true);
  });
});

describe("spokenBulletIndex", () => {
  const bullets = ["Rooftop panels doubled", "Costs fell by forty percent", "Bills cut by a third"];
  it("finds the bullet being talked about", () => {
    expect(spokenBulletIndex(bullets, "and as you can see the costs fell a lot, forty percent")).toBe(1);
    expect(spokenBulletIndex(bullets, "rooftop panels everywhere")).toBe(0);
  });
  it("returns -1 when nothing matches", () => {
    expect(spokenBulletIndex(bullets, "hello everyone")).toBe(-1);
    expect(spokenBulletIndex(bullets, "")).toBe(-1);
  });
  it("works for Malayalam script", () => {
    expect(spokenBulletIndex(["സൗരോർജ്ജം വളരുന്നു", "ചെലവ് കുറഞ്ഞു"], "ഇപ്പോൾ സൗരോർജ്ജം വളരുന്നു")).toBe(0);
  });
});

describe("alignWords", () => {
  it("keeps keys stable when words are appended", () => {
    expect(alignWords({ words: ["a", "b", "c"], base: 0 }, ["a", "b", "c", "d"])).toBe(0);
  });
  it("shifts the base when old words scroll off", () => {
    expect(alignWords({ words: ["a", "b", "c", "d"], base: 10 }, ["c", "d", "e"])).toBe(12);
  });
  it("starts fresh when the caption is unrelated", () => {
    expect(alignWords({ words: ["a", "b"], base: 3 }, ["x", "y", "z"])).toBe(5);
  });
});
