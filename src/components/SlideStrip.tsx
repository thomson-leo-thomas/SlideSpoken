"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Deck } from "@/lib/slide";
import { themeVars } from "@/lib/themes";
import { SlideView } from "./SlideView";

export function SlideStrip({ deck, onSelect }: { deck: Deck; onSelect: (index: number) => void }) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [deck.activeIndex, deck.slides.length]);

  if (deck.slides.length === 0) return null;
  const vars = themeVars(deck.theme) as CSSProperties;

  return (
    <div className="no-anim flex gap-3 overflow-x-auto pb-2">
      {deck.slides.map((slide, i) => {
        const active = i === deck.activeIndex;
        return (
          <button
            key={slide.id}
            ref={active ? activeRef : undefined}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Go to slide ${i + 1}: ${slide.title}`}
            aria-current={active}
            className={`relative aspect-video w-40 shrink-0 overflow-hidden rounded-xl text-left transition ${
              active ? "ring-2 ring-white/80" : "opacity-55 ring-1 ring-white/10 hover:opacity-100"
            }`}
            style={{ ...vars, background: "var(--s-bg)", color: "var(--s-fg)", fontFamily: "var(--s-font)" }}
          >
            <div className="pointer-events-none absolute inset-0 [container-type:inline-size]">
              <SlideView slide={slide} />
            </div>
            <span className="absolute bottom-1 left-1.5 rounded bg-black/40 px-1 text-[10px] font-medium text-white/80">{i + 1}</span>
          </button>
        );
      })}
    </div>
  );
}
