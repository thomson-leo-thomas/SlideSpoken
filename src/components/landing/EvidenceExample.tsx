"use client";

import { useState } from "react";

const PARTS = [
  { text: "Last year our village built a water tank. Now it " },
  { text: "saves families two hours every day", source: 0 },
  { text: ", and " },
  { text: "the school has clean water", source: 1 },
  { text: " for the first time." },
];
const BULLETS = ["Saves families two hours every day", "Clean water for the school"];

/** Hover, focus or tap a bullet to highlight the transcript phrase it came from. */
export function EvidenceExample() {
  const [active, setActive] = useState(0);

  return (
    <figure className="m-0 border border-ink/20 bg-paper-light p-5 sm:p-8">
      <div className="grid gap-6 md:grid-cols-[1.2fr_auto_1fr] md:items-center md:gap-8">
        <div>
          <p className="mb-3 font-code text-[11px] uppercase tracking-[0.14em] text-muted">Transcript</p>
          <p className="font-code text-[15px] leading-loose">
            {PARTS.map((part, i) =>
              part.source === undefined ? (
                <span key={i}>{part.text}</span>
              ) : (
                <mark key={i} className={`evidence ${part.source === active ? "is-active" : ""}`}>
                  {part.text}
                </mark>
              ),
            )}
          </p>
        </div>

        <p className="flex items-center gap-2 font-code text-[11px] uppercase tracking-[0.14em] text-muted md:flex-col">
          <span aria-hidden className="text-lg leading-none text-gold md:rotate-0">
            <span className="md:hidden">↓</span>
            <span className="hidden md:inline">→</span>
          </span>
          evidence
        </p>

        <div>
          <p className="mb-3 font-code text-[11px] uppercase tracking-[0.14em] text-muted">Slide</p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {BULLETS.map((b, i) => (
              <li key={b}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className={`w-full border px-4 py-3 text-left text-[16px] transition-colors ${
                    active === i ? "border-ink bg-paper" : "border-ink/20 hover:border-ink/50"
                  }`}
                >
                  {b}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="mt-5 font-code text-[11px] uppercase tracking-[0.14em] text-muted">
        Example. Tap a bullet to see where it came from.
      </figcaption>
    </figure>
  );
}
