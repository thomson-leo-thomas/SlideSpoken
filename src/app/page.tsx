"use client";

import { useState } from "react";
import { AlertTriangle, Info, Trash2, Wand2 } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ListenButton } from "@/components/ListenButton";
import { SlideCanvas } from "@/components/SlideCanvas";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { useSlideGenerator } from "@/hooks/useSlideGenerator";
import { useSlideImages } from "@/hooks/useSlideImages";
import { useTranscriber } from "@/hooks/useTranscriber";
import type { VoiceCommand } from "@/lib/commands";
import { DEFAULT_LANGUAGE, type LanguageCode } from "@/lib/languages";

const COMMAND_LABELS: Record<VoiceCommand, string> = {
  next: "next slide",
  back: "go back",
  quote: "make this a quote",
  title: "add a title slide",
};

export default function Home() {
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const t = useTranscriber(language);
  const slides = useSlideGenerator(t.segments, t.isListening, language);
  const imageFor = useSlideImages(slides.deck);
  const activeSlide = slides.deck.slides[slides.deck.activeIndex];

  const clearAll = () => {
    t.clear();
    slides.reset();
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-4 p-6 lg:h-dvh">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Slide<span className="text-indigo-400">spoken</span>
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <LanguageSelector value={language} onChange={setLanguage} />
          <ListenButton listening={t.isListening} starting={t.status === "starting"} onStart={t.start} onStop={t.stop} />
          <button
            type="button"
            onClick={clearAll}
            disabled={t.segments.length === 0 && slides.deck.slides.length === 0}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-white/70 transition hover:bg-white/5 disabled:opacity-40"
            aria-label="Clear transcript and slides"
            title="Clear transcript and slides"
          >
            <Trash2 className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </header>

      <div className="flex items-center gap-2 text-sm text-white/60">
        <span className={`h-2.5 w-2.5 rounded-full ${t.isListening ? "animate-pulse bg-red-500" : "bg-white/30"}`} />
        {t.isListening ? "Listening" : "Not listening"}
        <span className="text-white/30">·</span>
        {t.mode === "openai" ? "OpenAI transcription" : "Browser speech recognition"}
        {slides.lastCommand && (
          <span key={slides.lastCommand.at} className="animate-fade-up ml-auto flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-indigo-200">
            <Wand2 className="h-4 w-4" aria-hidden />
            Voice command: {COMMAND_LABELS[slides.lastCommand.command]}
          </span>
        )}
      </div>

      {[t.error].filter(Boolean).map((message) => (
        <div key={message} role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          {message}
        </div>
      ))}
      {[t.error ? null : t.notice, slides.notice].filter(Boolean).map((message) => (
        <div key={message} className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100">
          <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          {message}
        </div>
      ))}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <SlideCanvas
          deck={slides.deck}
          generating={slides.generating}
          image={activeSlide ? imageFor(activeSlide.id, activeSlide.imageQuery) : undefined}
          onPrev={slides.prev} onNext={slides.next} />
        <TranscriptPanel segments={t.segments} interim={t.interim} pendingChunks={t.pendingChunks} listening={t.isListening} />
      </div>
    </main>
  );
}
