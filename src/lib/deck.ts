import { EMPTY_DECK, type Deck, type Slide, type SlideResponse } from "./slide";

export function applySlideResponse(deck: Deck, response: SlideResponse, newId: () => string): Deck {
  const { action, ...content } = response;
  const hasActive = deck.activeIndex >= 0 && deck.activeIndex < deck.slides.length;

  if (action === "update" && hasActive) {
    const current = deck.slides[deck.activeIndex];
    const updated: Slide = { ...content, id: current.id };
    if (!content.imageQuery && current.imageQuery) updated.imageQuery = current.imageQuery;
    const slides = deck.slides.slice();
    slides[deck.activeIndex] = updated;
    return { slides, activeIndex: deck.activeIndex };
  }

  const slides = [...deck.slides, { ...content, id: newId() }];
  return { slides, activeIndex: slides.length - 1 };
}

export function goToSlide(deck: Deck, index: number): Deck {
  if (deck.slides.length === 0) return EMPTY_DECK;
  const clamped = Math.min(Math.max(index, 0), deck.slides.length - 1);
  return clamped === deck.activeIndex ? deck : { ...deck, activeIndex: clamped };
}
