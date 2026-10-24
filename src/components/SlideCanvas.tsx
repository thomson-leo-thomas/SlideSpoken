"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Maximize, Minimize, Presentation } from "lucide-react";
import type { SlideImage } from "@/lib/images";
import type { Deck } from "@/lib/slide";
import { SlideImageLayer } from "./SlideImageLayer";
import { SlideView } from "./SlideView";

interface Props {
  deck: Deck;
  generating: boolean;
  image?: SlideImage;
  onPrev: () => void;
  onNext: () => void;
}

export function SlideCanvas({ deck, generating, image, onPrev, onNext }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const slide = deck.slides[deck.activeIndex];

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frameRef.current?.requestFullscreen();
  };

  return (
    <section className="flex flex-col gap-3">
      <div ref={frameRef} className="flex items-center justify-center bg-background">
        <div
          className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#141827] via-[#0f1220] to-[#1a1230] shadow-2xl [container-type:inline-size]"
          style={fullscreen ? { width: "min(100vw, calc(100vh * 16 / 9))", borderRadius: 0, border: 0 } : undefined}
        >
          {slide ? (
            <div key={slide.id} className="animate-slide-in absolute inset-0">
              {image?.url && <SlideImageLayer key={image.url} image={image} />}
              <div className="relative h-full">
                <SlideView slide={slide} />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[1.5cqw] text-white/40">
              <Presentation style={{ width: "6cqw", height: "6cqw" }} aria-hidden />
              <p style={{ fontSize: "2.4cqw" }}>Your slides will appear here as you speak.</p>
            </div>
          )}
          {generating && (
            <div className="absolute right-[1.5cqw] top-[1.5cqw] flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white/80 backdrop-blur">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Generating slide…
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={deck.activeIndex <= 0}
            className="rounded-lg border border-white/10 p-2 text-white/80 transition hover:bg-white/5 disabled:opacity-30"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <span className="min-w-16 text-center text-sm tabular-nums text-white/60">
            {deck.slides.length ? `${deck.activeIndex + 1} / ${deck.slides.length}` : "0 / 0"}
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={deck.activeIndex >= deck.slides.length - 1}
            className="rounded-lg border border-white/10 p-2 text-white/80 transition hover:bg-white/5 disabled:opacity-30"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
        >
          {fullscreen ? <Minimize className="h-4 w-4" aria-hidden /> : <Maximize className="h-4 w-4" aria-hidden />}
          {fullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
      </div>
    </section>
  );
}
