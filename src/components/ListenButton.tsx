"use client";

import { useEffect, useRef } from "react";
import { Loader2, Mic, Square } from "lucide-react";

interface Props {
  listening: boolean;
  starting: boolean;
  levelRef: { current: number };
  onStart: () => void;
  onStop: () => void;
}

const BAR_GAINS = [0.55, 0.85, 1, 0.75, 0.5];

export function ListenButton({ listening, starting, levelRef, onStart, onStop }: Props) {
  const barsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!listening) return;
    let raf = 0;
    const tick = () => {
      const level = Math.min(1, levelRef.current * 9);
      barsRef.current?.querySelectorAll<HTMLSpanElement>("span").forEach((bar, i) => {
        bar.style.transform = `scaleY(${0.18 + level * BAR_GAINS[i] * (0.75 + Math.random() * 0.25)})`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [listening, levelRef]);

  if (listening) {
    return (
      <button
        type="button"
        onClick={onStop}
        className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-red-500/30 transition hover:brightness-110"
      >
        {starting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Square className="h-5 w-5 fill-current" aria-hidden />}
        Stop Listening
        <span ref={barsRef} className="ml-1 flex h-6 items-center gap-[3px]" aria-hidden>
          {BAR_GAINS.map((_, i) => (
            <span key={i} className="h-full w-[3px] origin-center rounded-full bg-white/90 transition-transform duration-75" style={{ transform: "scaleY(0.18)" }} />
          ))}
        </span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onStart}
      className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:brightness-110"
    >
      <Mic className="h-5 w-5 transition group-hover:scale-110" aria-hidden />
      Start Listening
    </button>
  );
}
