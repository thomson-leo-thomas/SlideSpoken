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
  const lastId = segments.at(-1)?.id;

  return (
    <section className="glass flex min-h-48 flex-1 flex-col overflow-hidden rounded-3xl">
      <header className="flex items-center justify-between px-5 pb-2 pt-4">
        <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/45">
          <span className={`h-1.5 w-1.5 rounded-full ${listening ? "animate-pulse bg-rose-400" : "bg-white/30"}`} />
          Live transcript
        </h2>
        {pendingChunks > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-white/50">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Transcribing
          </span>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 text-[17px] leading-relaxed" aria-live="polite">
        {empty ? (
          <p className="text-white/35">{listening ? "Listening… start speaking." : "Your words will appear here."}</p>
        ) : (
          <p>
            {segments.map((s) => (
              <span key={s.id} className={`transition-colors duration-700 ${s.id === lastId ? "text-white" : "text-white/55"}`}>
                {s.text}{" "}
              </span>
            ))}
            {interim && <span className="text-white/35">{interim}</span>}
          </p>
        )}
        <div ref={endRef} />
      </div>
    </section>
  );
}
