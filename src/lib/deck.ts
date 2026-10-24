import { DEFAULT_ICON } from "./icons";
import { DEFAULT_EMOJI, EMPTY_DECK, type Deck, type Slide, type SlideResponse } from "./slide";

/**
 * Applies a model response. "update" rewrites the target slide (by id, defaulting to the active slide);
 * "new", or an update with nothing to update, appends a slide and makes it active.
 */
export function applySlideResponse(deck: Deck, response: SlideResponse, newId: () => string, targetId?: string): Deck {
  const { action, theme, ...content } = response;
  const nextTheme = theme ?? deck.theme;
  const index = targetId ? deck.slides.findIndex((s) => s.id === targetId) : deck.activeIndex;

  if (action === "update" && index >= 0 && index < deck.slides.length) {
    const current = deck.slides[index];
    const updated: Slide = { ...content, id: current.id };
    if (!content.imageQuery && current.imageQuery) updated.imageQuery = current.imageQuery;
    const slides = deck.slides.slice();
    slides[index] = updated;
    return { ...deck, slides, theme: nextTheme };
  }

  const slides = [...deck.slides, { ...content, id: newId() }];
  return { ...deck, slides, activeIndex: slides.length - 1, theme: nextTheme };
}

export function goToSlide(deck: Deck, index: number): Deck {
  if (deck.slides.length === 0) return EMPTY_DECK;
  const clamped = Math.min(Math.max(index, 0), deck.slides.length - 1);
  return clamped === deck.activeIndex ? deck : { ...deck, activeIndex: clamped };
}

/** Turns the active slide into a quote: its first bullet (or title) becomes the quote text. */
export function makeQuote(deck: Deck): Deck {
  const current = deck.slides[deck.activeIndex];
  if (!current || current.layout === "quote") return deck;
  const slides = deck.slides.slice();
  slides[deck.activeIndex] = { ...current, layout: "quote", icon: "Quote", title: current.bullets[0] ?? current.title, bullets: [] };
  return { ...deck, slides };
}

/** Inserts a title slide after the active slide and activates it, so the next speech can fill it in. */
export function addTitleSlide(deck: Deck, newId: () => string, placeholder: string): Deck {
  const current = deck.slides[deck.activeIndex];
  const slide: Slide = {
    id: newId(),
    layout: "title",
    title: current?.title ?? placeholder,
    bullets: [],
    icon: current?.icon ?? DEFAULT_ICON,
    emoji: current?.emoji ?? DEFAULT_EMOJI,
  };
  const at = deck.activeIndex + 1;
  const slides = [...deck.slides.slice(0, at), slide, ...deck.slides.slice(at)];
  return { ...deck, slides, activeIndex: at };
}
