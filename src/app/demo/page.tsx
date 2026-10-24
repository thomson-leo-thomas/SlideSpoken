"use client";

import { useState } from "react";
import { AlertTriangle, AudioLines, Captions, Info, Trash2, Wand2 } from "lucide-react";
import { LanguageSelector, type LanguageOption } from "@/components/LanguageSelector";
import { ListenButton } from "@/components/ListenButton";
import { SlideCanvas } from "@/components/SlideCanvas";
import { SlideStrip } from "@/components/SlideStrip";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { useSlideGenerator } from "@/hooks/useSlideGenerator";
import { useSlideImages } from "@/hooks/useSlideImages";
import { useTranscriber } from "@/hooks/useTranscriber";
import type { VoiceCommand } from "@/lib/commands";
import { AUTO_DETECT, DEFAULT_LANGUAGE, LANGUAGES, type LanguageCode, type SpeechLanguage } from "@/lib/languages";

const COMMAND_LABELS: Record<VoiceCommand, string> = {
  next: "next slide",
  back: "go back",
  quote: "make this a quote",
  title: "add a title slide",
};

const SLIDE_OPTIONS: LanguageOption<LanguageCode>[] = LANGUAGES.map((l) => ({ value: l.code, label: l.nativeLabel }));
const SPEAK_OPTIONS: LanguageOption<SpeechLanguage>[] = [{ value: AUTO_DETECT, label: "Auto" }, ...SLIDE_OPTIONS];

export default function Home() {
  const [slideLanguage, setSlideLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [speakLanguage, setSpeakLanguage] = useState<SpeechLanguage>(AUTO_DETECT);
  const [captions, setCaptions] = useState(true);
  const t = useTranscriber(speakLanguage, slideLanguage);
  const slides = useSlideGenerator(t.segments, t.isListening, slideLanguage);
  const imageFor = useSlideImages(slides.deck);
  const activeSlide = slides.deck.slides[slides.deck.activeIndex];

  const live = t.isListening ? t.live || t.interim || t.segments.at(-1)?.text || "" : "";

  const clearAll = () => {
    t.clear();
    slides.reset();
  };

  const notices = [t.error ? null : t.notice, slides.notice].filter((n): n is string => Boolean(n));

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/20">
              <AudioLines className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-semibold tracking-tight">Slidespoken</h1>
              <p className="text-xs text-white/45">Speak. Slides appear.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {slides.lastCommand && (
              <span
                key={slides.lastCommand.at}
                className="animate-toast flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1.5 text-indigo-100 ring-1 ring-indigo-400/30"
              >
                <Wand2 className="h-4 w-4" aria-hidden />
                {COMMAND_LABELS[slides.lastCommand.command]}
              </span>
            )}
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/65">
              <span className={`h-2 w-2 rounded-full ${t.isListening ? "animate-pulse bg-rose-500" : "bg-white/30"}`} />
              {t.isListening ? "Live" : "Idle"}
              <span className="text-white/25">·</span>
              {t.mode === "openai" ? "OpenAI" : "Browser speech"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          {t.error && (
            <div role="alert" className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-100">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              {t.error}
            </div>
          )}
          {notices.map((message) => (
            <div key={message} className="flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100">
              <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              {message}
            </div>
          ))}
          <SlideCanvas
            deck={slides.deck}
            generating={slides.generating}
            image={activeSlide ? imageFor(activeSlide.id, activeSlide.imageQuery) : undefined}
            live={live}
            showCaption={captions}
            levelRef={t.levelRef}
            onPrev={slides.prev}
            onNext={slides.next}
          />
          <SlideStrip deck={slides.deck} onSelect={slides.goTo} />
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-[84px] lg:h-[calc(100dvh-108px)]">
          <div className="glass flex flex-col gap-4 rounded-3xl p-5">
            <ListenButton
              listening={t.isListening}
              starting={t.status === "starting"}
              levelRef={t.levelRef}
              onStart={t.start}
              onStop={t.stop}
            />
            <LanguageSelector label="I speak" value={speakLanguage} options={SPEAK_OPTIONS} onChange={setSpeakLanguage} />
            <LanguageSelector label="Slides in" value={slideLanguage} options={SLIDE_OPTIONS} onChange={setSlideLanguage} />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCaptions((c) => !c)}
                aria-pressed={captions}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                  captions ? "border-white/20 bg-white/10 text-white" : "border-white/10 text-white/55 hover:text-white"
                }`}
              >
                <Captions className="h-4 w-4" aria-hidden />
                Captions
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={t.segments.length === 0 && slides.deck.slides.length === 0}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/55 transition hover:text-white disabled:opacity-40"
                aria-label="Clear transcript and slides"
                title="Clear transcript and slides"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Clear
              </button>
            </div>
          </div>

          <TranscriptPanel segments={t.segments} interim={t.interim} pendingChunks={t.pendingChunks} listening={t.isListening} />

          <div className="glass rounded-3xl px-5 py-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/45">
              <Wand2 className="h-3.5 w-3.5" aria-hidden />
              Say
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(COMMAND_LABELS).map((c) => (
                <span key={c} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/70">
                  “{c}”
                </span>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
