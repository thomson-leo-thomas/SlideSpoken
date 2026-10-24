"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { TranscriptSegment } from "@/hooks/useTranscriber";

interface Props {
  segments: TranscriptSegment[];
  interim: string;
  pendingChunks: number;
  listening: boolean;
}

export function TranscriptPanel({ segments, interim, pendingChunks, listening }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [segments.length, interim]);

  const empty = segments.length === 0 && !interim;

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-white/[0.03]">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">Live transcript</h2>
        {pendingChunks > 0 && (
          <span className="flex items-center gap-1.5 text-sm text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Transcribing…
          </span>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-xl leading-relaxed" aria-live="polite">
        {empty ? (
          <p className="text-white/40">
            {listening ? "Listening… start speaking." : "Press Start Listening and begin your talk."}
          </p>
        ) : (
          <p>
            {segments.map((s) => (
              <span key={s.id}>{s.text} </span>
            ))}
            {interim && <span className="text-white/40">{interim}</span>}
          </p>
        )}
        <div ref={endRef} />
      </div>
    </section>
  );
}
