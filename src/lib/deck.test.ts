import { describe, expect, it } from "vitest";
import { addTitleSlide, applySlideResponse, goToSlide, makeQuote } from "./deck";
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

describe("applySlideResponse with a target slide", () => {
  it("updates the slide that was active when the request started, even after navigation", () => {
    let deck = applySlideResponse(EMPTY_DECK, response({ title: "A" }), id);
    deck = applySlideResponse(deck, response({ title: "B" }), id);
    const targetId = deck.slides[1].id;
    const navigated: Deck = { ...deck, activeIndex: 0 };
    const updated = applySlideResponse(navigated, response({ action: "update", title: "B2" }), id, targetId);
    expect(updated.slides.map((s) => s.title)).toEqual(["A", "B2"]);
    expect(updated.activeIndex).toBe(0);
  });
  it("appends when the target slide no longer exists", () => {
    const deck = applySlideResponse(EMPTY_DECK, response({ title: "A" }), id);
    const updated = applySlideResponse(deck, response({ action: "update", title: "X" }), id, "missing");
    expect(updated.slides).toHaveLength(2);
  });
});

describe("makeQuote", () => {
  it("turns the active slide into a quote using its first bullet", () => {
    const deck = applySlideResponse(EMPTY_DECK, response({ title: "Vision", bullets: ["Power to every home", "x"] }), id);
    const quoted = makeQuote(deck);
    expect(quoted.slides[0]).toMatchObject({ layout: "quote", title: "Power to every home", bullets: [], icon: "Quote" });
    expect(quoted.slides[0].id).toBe(deck.slides[0].id);
  });
  it("uses the title when there are no bullets and is a no-op on an empty deck", () => {
    const deck = applySlideResponse(EMPTY_DECK, response({ title: "Dream big", bullets: [] }), id);
    expect(makeQuote(deck).slides[0].title).toBe("Dream big");
    expect(makeQuote(EMPTY_DECK)).toBe(EMPTY_DECK);
  });
});

describe("addTitleSlide", () => {
  it("adds a placeholder title slide to an empty deck", () => {
    const deck = addTitleSlide(EMPTY_DECK, id, "Title");
    expect(deck.slides[0]).toMatchObject({ layout: "title", title: "Title", bullets: [] });
    expect(deck.activeIndex).toBe(0);
  });
  it("inserts after the active slide and activates it", () => {
    let deck = applySlideResponse(EMPTY_DECK, response({ title: "A" }), id);
    deck = applySlideResponse(deck, response({ title: "B" }), id);
    const inserted = addTitleSlide({ ...deck, activeIndex: 0 }, id, "Title");
    expect(inserted.slides.map((s) => s.title)).toEqual(["A", "A", "B"]);
    expect(inserted.slides[1].layout).toBe("title");
    expect(inserted.activeIndex).toBe(1);
  });
});
