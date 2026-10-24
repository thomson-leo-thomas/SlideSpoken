"use client";

import { useEffect, useRef, useState } from "react";
import { imageKey, NO_IMAGE, slideImageSchema, type SlideImage } from "@/lib/images";
import type { Deck } from "@/lib/slide";

/**
 * Fetches a Pexels image per (slide, imageQuery) in the background. Results are stored by that key,
 * so a response for a slide's older query never matches what is rendered and is ignored.
 */
export function useSlideImages(deck: Deck) {
  const [images, setImages] = useState<Record<string, SlideImage>>({});
  const requestedRef = useRef(new Set<string>());
  const byQueryRef = useRef(new Map<string, Promise<SlideImage>>());

  useEffect(() => {
    for (const slide of deck.slides) {
      if (!slide.imageQuery) continue;
      const key = imageKey(slide.id, slide.imageQuery);
      if (requestedRef.current.has(key)) continue;
      requestedRef.current.add(key);

      const query = slide.imageQuery.trim().toLowerCase();
      let promise = byQueryRef.current.get(query);
      if (!promise) {
        promise = fetch(`/api/image?${new URLSearchParams({ query })}`)
          .then((res) => (res.ok ? res.json() : NO_IMAGE))
          .then((body) => slideImageSchema.parse(body))
          .catch(() => NO_IMAGE);
        byQueryRef.current.set(query, promise);
      }
      void promise.then((image) => setImages((prev) => ({ ...prev, [key]: image })));
    }
  }, [deck.slides]);

  return (slideId: string, query: string | undefined): SlideImage | undefined =>
    query ? images[imageKey(slideId, query)] : undefined;
}
