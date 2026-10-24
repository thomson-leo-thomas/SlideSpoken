"use client";

import { useEffect, useState } from "react";

const LINE = "Our water tank project saves families two hours every day.";
const TYPE_MS = 45;
const SLIDE_DELAY_MS = 3000;
const HOLD_MS = 4500;
const RESET_MS = 900;

/** Simulated example: speech is typed out, and the slide follows about 3 seconds later. */
export function HeroDemo() {
  const [chars, setChars] = useState(0);
  const [showSlide, setShowSlide] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setChars(LINE.length);
      setShowSlide(true);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    let n = 0;
    const type = () => {
      n += 1;
      setChars(n);
      if (n < LINE.length) timer = setTimeout(type, TYPE_MS);
      else timer = setTimeout(show, SLIDE_DELAY_MS);
    };
    const show = () => {
      setShowSlide(true);
      timer = setTimeout(reset, HOLD_MS);
    };
    const reset = () => {
      setShowSlide(false);
      timer = setTimeout(() => {
        n = 0;
        setChars(0);
        timer = setTimeout(type, RESET_MS);
      }, RESET_MS);
    };
    timer = setTimeout(type, 600);
    return () => clearTimeout(timer);
  }, []);

  const typing = chars < LINE.length;

  return (
    <figure className="m-0">
      <div className="grid gap-4 sm:grid-cols-2 sm:items-center sm:gap-6">
        <div className="min-h-[148px] border border-ink/20 bg-paper-light p-5">
          <p className="mb-3 font-code text-[11px] uppercase tracking-[0.14em] text-muted">Transcript</p>
          <p className="font-code text-[15px] leading-relaxed">
            <span className="sr-only">{LINE}</span>
            <span aria-hidden>{LINE.slice(0, chars)}</span>
            <span aria-hidden className={`caret ${typing ? "" : "opacity-0"}`} />
          </p>
        </div>
        <div
          className={`aspect-video border border-ink bg-paper-light p-5 transition-opacity duration-700 sm:p-6 ${showSlide ? "opacity-100" : "opacity-0"}`}
          aria-hidden={!showSlide}
        >
          <div className="flex h-full flex-col justify-center gap-3">
            <p className="font-display text-[28px] leading-tight sm:text-[32px]">Water tank project</p>
            <span className="h-px w-10 bg-gold" />
            <p className="flex items-baseline gap-2 text-[15px]">
              <span className="text-gold" aria-hidden>
                —
              </span>
              Saves families two hours every day
            </p>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 font-code text-[11px] uppercase tracking-[0.14em] text-muted">Example</figcaption>
    </figure>
  );
}
