"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Maximize, Minimize, Mic, Palette, Sparkles } from "lucide-react";
import type { SlideImage } from "@/lib/images";
import type { Deck, Slide } from "@/lib/slide";
import { themeFor, themeVars } from "@/lib/themes";
import { EmojiBurst } from "./EmojiBurst";
import { LiveWords } from "./LiveWords";
import { SlideImageLayer } from "./SlideImageLayer";
import { SlideView } from "./SlideView";
import { VoiceFx } from "./VoiceFx";

interface Props {
  deck: Deck;
  generating: boolean;
  image?: SlideImage;
  /** What is being said right now. */
  live: string;
  showCaption: boolean;
  levelRef: { current: number };
  onPrev: () => void;
  onNext: () => void;
}

const TRANSITION_MS = 800;
const BURST_MS = 1400;

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

function slideWords(slide: Slide | undefined): Set<string> {
  const text = slide ? `${slide.title} ${slide.bullets.join(" ")}` : "";
  return new Set(text.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter((w) => w.length >= 4));
}

export function SlideCanvas({ deck, generating, image, live, showCaption, levelRef, onPrev, onNext }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const slide = deck.slides[deck.activeIndex];
  const theme = themeFor(deck.theme);

  // Keep the previous slide around briefly so it can animate out while the new one animates in.
  const [outgoing, setOutgoing] = useState<{ slide: Slide; key: number } | null>(null);
  const [dir, setDir] = useState(1);
  const [burst, setBurst] = useState<string | null>(null);
  const prevRef = useRef<{ slide?: Slide; index: number; count: number }>({ index: -1, count: 0 });

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = { slide, index: deck.activeIndex, count: deck.slides.length };
    if (slide?.id === prev.slide?.id) return;
    setDir(deck.activeIndex >= prev.index ? 1 : -1);
    setOutgoing(prev.slide ? { slide: prev.slide, key: Date.now() } : null);
    if (slide && deck.slides.length > prev.count && deck.activeIndex === deck.slides.length - 1) setBurst(slide.id);
  }, [slide, deck.activeIndex, deck.slides.length]);

  useEffect(() => {
    if (!outgoing) return;
    const t = setTimeout(() => setOutgoing(null), TRANSITION_MS);
    return () => clearTimeout(t);
  }, [outgoing]);

  useEffect(() => {
    if (!burst) return;
    const t = setTimeout(() => setBurst(null), BURST_MS);
    return () => clearTimeout(t);
  }, [burst]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) onNext();
      else if (["ArrowLeft", "PageUp"].includes(e.key)) onPrev();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrev]);

  const highlight = useMemo(() => slideWords(slide), [slide]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frameRef.current?.requestFullscreen();
  };

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el || fullscreen || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(x * 4).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * 4).toFixed(2)}deg`);
  };
  const untilt = () => {
    stageRef.current?.style.setProperty("--ry", "0deg");
    stageRef.current?.style.setProperty("--rx", "0deg");
  };

  const navButton =
    "absolute top-1/2 z-30 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white/90 opacity-0 backdrop-blur transition hover:bg-black/50 group-hover:opacity-100 disabled:hidden";
  const layerStyle = { "--dir": dir } as CSSProperties;

  return (
    <section className="flex flex-col gap-3">
      <div ref={frameRef} className="group flex items-center justify-center [perspective:1600px] [&:fullscreen]:bg-black">
        <div
          ref={stageRef}
          onPointerMove={tilt}
          onPointerLeave={untilt}
          className="stage relative aspect-video w-full overflow-hidden rounded-3xl shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10 transition-[background] duration-700 [container-type:inline-size]"
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
              className="animate-float absolute rounded-full opacity-35"
              style={{
                left: "-14cqw",
                top: "-18cqw",
                width: "50cqw",
                height: "50cqw",
                background: "radial-gradient(circle, var(--s-accent) 0%, transparent 65%)",
                scale: "calc(1 + var(--voice, 0) * 0.45)",
              }}
            />
            <div
              className="animate-float-slow absolute rounded-full opacity-30"
              style={{
                right: "-12cqw",
                bottom: "-22cqw",
                width: "56cqw",
                height: "56cqw",
                background: "radial-gradient(circle, var(--s-accent2) 0%, transparent 65%)",
                scale: "calc(1 + var(--voice, 0) * 0.35)",
              }}
            />
          </div>
          <VoiceFx levelRef={levelRef} targetRef={stageRef} theme={deck.theme} />

          <div className="absolute inset-0 [perspective:1400px]">
            {outgoing && (
              <div key={`out-${outgoing.key}`} data-dir={dir} className={`pointer-events-none absolute inset-0 t-out-${theme.transition}`} style={layerStyle}>
                <SlideView slide={outgoing.slide} />
              </div>
            )}
            {slide ? (
              <div key={slide.id} data-dir={dir} className={`absolute inset-0 t-in-${theme.transition}`} style={layerStyle}>
                {image?.url && <SlideImageLayer key={image.url} image={image} />}
                <div className="relative h-full">
                  <SlideView slide={slide} spoken={live} interactive />
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-[1.6cqw] px-[8cqw] text-center">
                <span
                  className="flex items-center justify-center rounded-full text-white shadow-2xl"
                  style={{
                    width: "9cqw",
                    height: "9cqw",
                    background: "linear-gradient(135deg, var(--s-accent), var(--s-accent2))",
                    scale: "calc(1 + var(--voice, 0) * 0.3)",
                  }}
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
          </div>

          {slide && burst === slide.id && <EmojiBurst key={burst} emoji={slide.emoji} />}

          {generating && (
            <>
              <div className="shimmer-bar absolute inset-x-0 top-0 z-20 h-[0.35cqw]" />
              <div
                className="absolute right-[1.6cqw] top-[1.6cqw] z-20 flex items-center gap-[0.6cqw] rounded-full bg-black/35 px-[1.4cqw] py-[0.6cqw] text-white/90 backdrop-blur"
                style={{ fontSize: "1.3cqw" }}
              >
                <Sparkles className="animate-pulse" style={{ width: "1.5cqw", height: "1.5cqw" }} aria-hidden />
                Drafting…
              </div>
            </>
          )}

          {showCaption && live && (
            <div className="pointer-events-none absolute inset-x-[8cqw] bottom-[2.6cqw] z-20 flex justify-center">
              <LiveWords text={live} highlight={highlight} />
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
            <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/60 sm:flex">
              <Palette className="h-4 w-4" aria-hidden />
              {theme.label} theme
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
