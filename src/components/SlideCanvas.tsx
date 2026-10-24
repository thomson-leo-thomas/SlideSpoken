"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Maximize, Minimize, Mic, Palette, Sparkles } from "lucide-react";
import type { SlideImage } from "@/lib/images";
import type { Deck } from "@/lib/slide";
import { themeFor, themeVars } from "@/lib/themes";
import { SlideImageLayer } from "./SlideImageLayer";
import { SlideView } from "./SlideView";

interface Props {
  deck: Deck;
  generating: boolean;
  image?: SlideImage;
  caption?: string;
  onPrev: () => void;
  onNext: () => void;
}

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

export function SlideCanvas({ deck, generating, image, caption, onPrev, onNext }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const slide = deck.slides[deck.activeIndex];

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (["ArrowRight", "PageDown"].includes(e.key)) onNext();
      else if (["ArrowLeft", "PageUp"].includes(e.key)) onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrev]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frameRef.current?.requestFullscreen();
  };

  const navButton =
    "absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white/90 opacity-0 backdrop-blur transition hover:bg-black/50 group-hover:opacity-100 disabled:hidden";

  return (
    <section className="flex flex-col gap-3">
      <div ref={frameRef} className="group flex items-center justify-center bg-black/0 [&:fullscreen]:bg-black">
        <div
          className="relative aspect-video w-full overflow-hidden rounded-3xl shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10 transition-[background] duration-700 [container-type:inline-size]"
          style={{
            ...(themeVars(deck.theme) as CSSProperties),
            background: "var(--s-bg)",
            color: "var(--s-fg)",
            fontFamily: "var(--s-font)",
            ...(fullscreen ? { width: "min(100vw, calc(100vh * 16 / 9))", borderRadius: 0 } : {}),
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="animate-float absolute rounded-full opacity-25"
              style={{ left: "-10cqw", top: "-14cqw", width: "38cqw", height: "38cqw", filter: "blur(7cqw)", background: "var(--s-accent)" }}
            />
            <div
              className="animate-float-slow absolute rounded-full opacity-20"
              style={{ right: "-8cqw", bottom: "-16cqw", width: "42cqw", height: "42cqw", filter: "blur(8cqw)", background: "var(--s-accent2)" }}
            />
          </div>

          {slide ? (
            <div key={slide.id} className="animate-slide-in absolute inset-0">
              {image?.url && <SlideImageLayer key={image.url} image={image} />}
              <div className="relative h-full">
                <SlideView slide={slide} />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[1.6cqw] px-[8cqw] text-center">
              <span
                className="flex items-center justify-center rounded-full text-white shadow-2xl"
                style={{ width: "9cqw", height: "9cqw", background: "linear-gradient(135deg, var(--s-accent), var(--s-accent2))" }}
              >
                <Mic style={{ width: "4cqw", height: "4cqw" }} aria-hidden />
              </span>
              <p className="font-semibold" style={{ fontSize: "3.4cqw" }}>
                Start talking. Slides appear as you speak.
              </p>
              <p className="text-[var(--s-muted)]" style={{ fontSize: "1.8cqw" }}>
                English · മലയാളം · हिन्दी, translated to your slide language
              </p>
            </div>
          )}

          {generating && (
            <>
              <div className="shimmer-bar absolute inset-x-0 top-0 h-[0.35cqw]" />
              <div
                className="absolute right-[1.6cqw] top-[1.6cqw] flex items-center gap-[0.6cqw] rounded-full bg-black/35 px-[1.4cqw] py-[0.6cqw] text-white/90 backdrop-blur"
                style={{ fontSize: "1.3cqw" }}
              >
                <Sparkles className="animate-pulse" style={{ width: "1.5cqw", height: "1.5cqw" }} aria-hidden />
                Drafting…
              </div>
            </>
          )}

          {caption && (
            <div className="pointer-events-none absolute inset-x-[10cqw] bottom-[2.2cqw] flex justify-center">
              <p
                className="max-w-full truncate rounded-full bg-black/45 px-[1.8cqw] py-[0.7cqw] text-white/90 backdrop-blur"
                style={{ fontSize: "1.6cqw", fontFamily: "var(--font-sans)" }}
              >
                {caption}
              </p>
            </div>
          )}

          <button type="button" onClick={onPrev} disabled={deck.activeIndex <= 0} className={`${navButton} left-[1.5cqw] h-11 w-11`} aria-label="Previous slide">
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={deck.activeIndex >= deck.slides.length - 1}
            className={`${navButton} right-[1.5cqw] h-11 w-11`}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          <button type="button" onClick={onPrev} disabled={deck.activeIndex <= 0} className="rounded-full p-1.5 text-white/80 transition hover:bg-white/10 disabled:opacity-30" aria-label="Previous slide">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="min-w-14 text-center tabular-nums text-white/70">
            {deck.slides.length ? `${deck.activeIndex + 1} / ${deck.slides.length}` : "0 / 0"}
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={deck.activeIndex >= deck.slides.length - 1}
            className="rounded-full p-1.5 text-white/80 transition hover:bg-white/10 disabled:opacity-30"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {deck.slides.length > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/60">
              <Palette className="h-4 w-4" aria-hidden />
              {themeFor(deck.theme).label} theme
            </span>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/80 transition hover:bg-white/10"
          >
            {fullscreen ? <Minimize className="h-4 w-4" aria-hidden /> : <Maximize className="h-4 w-4" aria-hidden />}
            {fullscreen ? "Exit" : "Present"}
          </button>
        </div>
      </div>
    </section>
  );
}
