import { describe, expect, it } from "vitest";
import { evidenceMatches, groundSlide } from "./grounding";
import type { SlideRequest } from "./slide";

const transcript = "Rooftop solar panels in Kerala doubled in three years, and costs fell by 40 percent.";
const empty: SlideRequest["currentDeck"] = { slides: [], activeIndex: -1 };
const raw = (over: Record<string, unknown> = {}) => ({
  action: "new",
  title: "Solar in Kerala",
  titleEvidence: "solar panels in Kerala",
  bullets: [
    { text: "Panels doubled in 3 years", evidence: "doubled in three years" },
    { text: "Costs down 40%", evidence: "costs fell by 40 percent" },
  ],
  layout: "bullets",
  ...over,
});

describe("evidenceMatches", () => {
  it("matches verbatim phrases ignoring case and punctuation", () => {
    expect(evidenceMatches("Costs fell by 40 percent.", transcript)).toBe(true);
    expect(evidenceMatches("in Kerala, doubled", transcript)).toBe(true);
  });
  it("tolerates a small transcription difference in longer phrases", () => {
    expect(evidenceMatches("rooftop solar panel in Kerala doubled", transcript)).toBe(true);
  });
  it("rejects phrases that were not said, and trivial evidence", () => {
    expect(evidenceMatches("creates thousands of jobs", transcript)).toBe(false);
    expect(evidenceMatches("in", transcript)).toBe(false);
    expect(evidenceMatches("", transcript)).toBe(false);
  });
  it("matches Malayalam script", () => {
    expect(evidenceMatches("പാനലുകൾ ഇരട്ടിയായി", "റൂഫ്‌ടോപ്പ് പാനലുകൾ ഇരട്ടിയായി.")).toBe(true);
  });
});

describe("groundSlide", () => {
  it("keeps grounded bullets and strips the evidence fields", () => {
    const r = groundSlide(raw(), { recentTranscript: transcript, currentDeck: empty });
    expect(r).toMatchObject({ kind: "slide", rejected: 0, raw: { bullets: ["Panels doubled in 3 years", "Costs down 40%"] } });
    if (r.kind === "slide") expect(r.raw).not.toHaveProperty("titleEvidence");
  });
  it("drops bullets whose evidence is not in the transcript", () => {
    const r = groundSlide(raw({ bullets: [...raw().bullets, { text: "Importance of renewables", evidence: "renewables are important" }] }), {
      recentTranscript: transcript,
      currentDeck: empty,
    });
    expect(r).toMatchObject({ kind: "slide", rejected: 1 });
    if (r.kind === "slide") expect(r.raw.bullets).toHaveLength(2);
  });
  it("skips when the model says skip or the title is unsupported", () => {
    expect(groundSlide(raw({ action: "skip" }), { recentTranscript: transcript, currentDeck: empty }).kind).toBe("skip");
    expect(groundSlide(raw({ titleEvidence: "wind energy future", bullets: [] }), { recentTranscript: transcript, currentDeck: empty }).kind).toBe("skip");
  });
  it("falls back to a title-only slide when no bullet survives", () => {
    const r = groundSlide(raw({ bullets: [{ text: "Made up", evidence: "never said this" }] }), { recentTranscript: transcript, currentDeck: empty });
    expect(r).toMatchObject({ kind: "slide", raw: { layout: "title", bullets: [] } });
  });
  it("on update keeps existing bullets and appends only grounded new ones", () => {
    const deck = { slides: [{ title: "Solar in Kerala", bullets: ["Panels doubled"], layout: "bullets" as const }], activeIndex: 0 };
    const r = groundSlide(
      raw({
        action: "update",
        titleEvidence: "",
        bullets: [
          { text: "Panels have doubled", evidence: "old chunk words" },
          { text: "Bills cut by a third", evidence: "bills cut by a third" },
        ],
      }),
      { recentTranscript: "And household bills cut by a third.", currentDeck: deck },
    );
    expect(r).toMatchObject({ kind: "slide", raw: { bullets: ["Panels doubled", "Bills cut by a third"] } });
  });
  it("skips an update that adds nothing new", () => {
    const deck = { slides: [{ title: "Solar in Kerala", bullets: ["Panels doubled"], layout: "bullets" as const }], activeIndex: 0 };
    const r = groundSlide(raw({ action: "update", bullets: [{ text: "Panels doubled", evidence: "x" }] }), { recentTranscript: "yes indeed", currentDeck: deck });
    expect(r.kind).toBe("skip");
  });
  it("downgrades compare and diagram layouts that lost bullets", () => {
    const r = groundSlide(raw({ layout: "compare", bullets: [raw().bullets[0]] }), { recentTranscript: transcript, currentDeck: empty });
    expect(r).toMatchObject({ kind: "slide", raw: { layout: "bullets" } });
  });
});

describe("evidence must support the point", () => {
  it("rejects a real transcript phrase attached to an unrelated bullet or title", () => {
    const r = groundSlide(
      raw({ bullets: [{ text: "Wind farms expanding", evidence: "doubled in three years" }, raw().bullets[1]] }),
      { recentTranscript: transcript, currentDeck: empty },
    );
    expect(r).toMatchObject({ kind: "slide", rejected: 1, raw: { bullets: ["Costs down 40%"] } });
    expect(groundSlide(raw({ title: "Wind power", titleEvidence: "doubled in three years" }), { recentTranscript: transcript, currentDeck: empty })).toMatchObject({
      kind: "slide",
      raw: { title: "Panels doubled in 3 years", bullets: ["Costs down 40%"] },
    });
  });
  it("allows translated bullets whose evidence is in another script", () => {
    const r = groundSlide(
      raw({ title: "Rooftop panels", titleEvidence: "റൂഫ്‌ടോപ്പ് പാനലുകൾ", bullets: [{ text: "Panels doubled", evidence: "പാനലുകൾ ഇരട്ടിയായി" }] }),
      { recentTranscript: "റൂഫ്‌ടോപ്പ് പാനലുകൾ ഇരട്ടിയായി.", currentDeck: empty },
    );
    expect(r).toMatchObject({ kind: "slide", raw: { bullets: ["Panels doubled"] } });
  });
  it("never repeats a bullet already shown on another slide", () => {
    const deck = { slides: [{ title: "Earlier", bullets: ["Costs down 40%"], layout: "bullets" as const }], activeIndex: 0 };
    const r = groundSlide(raw(), { recentTranscript: transcript, currentDeck: deck });
    if (r.kind === "slide") expect(r.raw.bullets).toEqual(["Panels doubled in 3 years"]);
  });
});

describe("layout and title fixes", () => {
  it("turns a title slide that gained several bullets into a bullet slide", () => {
    const r = groundSlide(raw({ layout: "title" }), { recentTranscript: transcript, currentDeck: empty });
    expect(r).toMatchObject({ kind: "slide", raw: { layout: "bullets" } });
  });
  it("keeps the current title when an update's new title is not grounded", () => {
    const deck = { slides: [{ title: "Solar in Kerala", bullets: [], layout: "title" as const }], activeIndex: 0 };
    const r = groundSlide(raw({ action: "update", title: "Green Revolution", titleEvidence: "nothing like this" }), {
      recentTranscript: transcript,
      currentDeck: deck,
    });
    expect(r).toMatchObject({ kind: "slide", raw: { title: "Solar in Kerala" } });
  });
});
