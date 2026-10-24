import { describe, expect, it } from "vitest";
import { applySlideResponse, goToSlide } from "./deck";
import { EMPTY_DECK, type Deck, type SlideResponse } from "./slide";

let n = 0;
const id = () => `id-${++n}`;

const response = (overrides: Partial<SlideResponse> = {}): SlideResponse => ({
  action: "new",
  title: "Title",
  bullets: ["Point"],
  layout: "bullets",
  icon: "Sparkles",
  ...overrides,
});

describe("applySlideResponse", () => {
  it("adds the first slide and makes it active", () => {
    const deck = applySlideResponse(EMPTY_DECK, response(), id);
    expect(deck.slides).toHaveLength(1);
    expect(deck.activeIndex).toBe(0);
    expect(deck.slides[0]).not.toHaveProperty("action");
  });

  it("treats update on an empty deck as new", () => {
    const deck = applySlideResponse(EMPTY_DECK, response({ action: "update" }), id);
    expect(deck.slides).toHaveLength(1);
    expect(deck.activeIndex).toBe(0);
  });

  it("appends new slides and jumps to them", () => {
    let deck = applySlideResponse(EMPTY_DECK, response({ title: "A" }), id);
    deck = applySlideResponse(deck, response({ title: "B" }), id);
    expect(deck.slides.map((s) => s.title)).toEqual(["A", "B"]);
    expect(deck.activeIndex).toBe(1);
  });

  it("updates the active slide in place and keeps its id", () => {
    let deck = applySlideResponse(EMPTY_DECK, response({ title: "A" }), id);
    deck = applySlideResponse(deck, response({ title: "B" }), id);
    const viewing: Deck = { ...deck, activeIndex: 0 };
    const firstId = viewing.slides[0].id;
    const updated = applySlideResponse(viewing, response({ action: "update", title: "A2", bullets: ["x", "y"] }), id);
    expect(updated.slides).toHaveLength(2);
    expect(updated.activeIndex).toBe(0);
    expect(updated.slides[0]).toMatchObject({ id: firstId, title: "A2", bullets: ["x", "y"] });
    expect(updated.slides[1].title).toBe("B");
    expect(viewing.slides[0].title).toBe("A");
  });

  it("keeps the previous imageQuery when an update omits it", () => {
    const deck = applySlideResponse(EMPTY_DECK, response({ imageQuery: "mountains" }), id);
    const updated = applySlideResponse(deck, response({ action: "update", title: "More" }), id);
    expect(updated.slides[0].imageQuery).toBe("mountains");
  });
});

describe("goToSlide", () => {
  const deck: Deck = {
    slides: ["a", "b", "c"].map((t) => ({ id: t, title: t, bullets: [], layout: "title" as const, icon: "Sparkles" as const })),
    activeIndex: 1,
  };
  it("clamps to bounds", () => {
    expect(goToSlide(deck, -5).activeIndex).toBe(0);
    expect(goToSlide(deck, 10).activeIndex).toBe(2);
  });
  it("returns the same deck when the index is unchanged", () => {
    expect(goToSlide(deck, 1)).toBe(deck);
  });
  it("handles an empty deck", () => {
    expect(goToSlide(EMPTY_DECK, 3)).toEqual(EMPTY_DECK);
  });
});
