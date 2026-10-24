"use client";

import { useMemo, useRef } from "react";
import { alignWords } from "@/lib/live";

const MAX_WORDS = 12;
const NUMBER = /\p{N}/u;

/** Rolling caption where each newly spoken word pops in; numbers and words on the slide glow. */
export function LiveWords({ text, highlight }: { text: string; highlight: Set<string> }) {
  const prevRef = useRef<{ words: string[]; base: number }>({ words: [], base: 0 });

  const { words, base } = useMemo(() => {
    const next = text.split(/\s+/).filter(Boolean).slice(-MAX_WORDS);
    const b = alignWords(prevRef.current, next);
    prevRef.current = { words: next, base: b };
    return { words: next, base: b };
  }, [text]);

  if (words.length === 0) return null;
  return (
    <p
      className="flex max-w-full flex-wrap justify-center gap-x-[0.55cqw] rounded-[2cqw] bg-black/45 px-[2cqw] py-[0.8cqw] text-white/90 backdrop-blur-sm"
      style={{ fontSize: "1.7cqw", fontFamily: "var(--font-sans)" }}
    >
      {words.map((w, i) => {
        const key = w.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]/gu, "");
        const hot = NUMBER.test(w) || (key.length >= 4 && highlight.has(key));
        return (
          <span key={base + i} className={`animate-word inline-block ${hot ? "font-semibold text-[var(--s-accent)]" : ""}`}>
            {w}
          </span>
        );
      })}
    </p>
  );
}
