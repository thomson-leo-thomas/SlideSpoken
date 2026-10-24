"use client";

import { useMemo, type CSSProperties } from "react";

/** A one-shot burst of the slide's emoji when a new slide arrives. */
export function EmojiBurst({ emoji }: { emoji: string }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 18 + Math.random() * 22;
        return {
          "--x": `${Math.cos(angle) * dist}cqw`,
          "--y": `${Math.sin(angle) * dist * 0.6}cqw`,
          "--r": `${(Math.random() - 0.5) * 120}deg`,
          animationDelay: `${Math.random() * 120}ms`,
          fontSize: `${2 + Math.random() * 2.5}cqw`,
        } as CSSProperties;
      }),
    [],
  );
  return (
    <div className="pointer-events-none absolute left-1/2 top-[45%] z-20" aria-hidden>
      {bits.map((style, i) => (
        <span key={i} className="emoji animate-burst absolute -translate-x-1/2 -translate-y-1/2" style={style}>
          {emoji}
        </span>
      ))}
    </div>
  );
}
