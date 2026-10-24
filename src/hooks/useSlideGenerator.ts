"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseVoiceCommands, type VoiceCommand } from "@/lib/commands";
import { addTitleSlide, applySlideResponse, goToSlide, makeQuote } from "@/lib/deck";
import { fallbackSlide } from "@/lib/fallback";
import { titlePlaceholderFor, type LanguageCode } from "@/lib/languages";
import { shouldRequestSlide } from "@/lib/schedule";
import { deckContext, EMPTY_DECK, MAX_TRANSCRIPT_CHARS, slideResponseSchema, type Deck } from "@/lib/slide";
import type { TranscriptSegment } from "./useTranscriber";

const TICK_MS = 1000;

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useSlideGenerator(segments: TranscriptSegment[], listening: boolean, language: LanguageCode) {
  const [deck, setDeck] = useState<Deck>(EMPTY_DECK);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<{ command: VoiceCommand; at: number } | null>(null);

  const deckRef = useRef(deck);
  const cleanedRef = useRef(new Map<number, string>());
  const consumedRef = useRef(new Set<number>());
  const inFlightRef = useRef(false);
  const lastRequestAtRef = useRef<number | null>(null);
  const lastSegmentAtRef = useRef<number | null>(null);
  const segmentsRef = useRef(segments);
  const listeningRef = useRef(listening);
  const languageRef = useRef(language);

  const commit = useCallback((next: Deck) => {
    deckRef.current = next;
    setDeck(next);
  }, []);

  const runCommand = useCallback(
    (command: VoiceCommand) => {
      const d = deckRef.current;
      if (command === "next") commit(goToSlide(d, d.activeIndex + 1));
      else if (command === "back") commit(goToSlide(d, d.activeIndex - 1));
      else if (command === "quote") commit(makeQuote(d));
      else commit(addTitleSlide(d, newId, titlePlaceholderFor(languageRef.current)));
      setLastCommand({ command, at: Date.now() });
    },
    [commit],
  );

  useEffect(() => {
    let added = false;
    for (const segment of segments) {
      if (cleanedRef.current.has(segment.id)) continue;
      const { commands, text } = parseVoiceCommands(segment.text);
      cleanedRef.current.set(segment.id, text);
      commands.forEach(runCommand);
      added = true;
    }
    if (added) lastSegmentAtRef.current = Date.now();
    segmentsRef.current = segments;
  }, [segments, runCommand]);

  useEffect(() => {
    listeningRef.current = listening;
    languageRef.current = language;
  }, [listening, language]);

  const requestSlide = useCallback(
    async (ids: number[], recentTranscript: string) => {
      ids.forEach((id) => consumedRef.current.add(id));
      const targetId = deckRef.current.slides[deckRef.current.activeIndex]?.id;
      inFlightRef.current = true;
      lastRequestAtRef.current = Date.now();
      setGenerating(true);
      try {
        const res = await fetch("/api/slide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recentTranscript,
            currentDeck: deckContext(deckRef.current),
            language: languageRef.current,
          }),
        });
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const message =
            body && typeof body === "object" && "error" in body && typeof body.error === "string"
              ? body.error
              : `Slide generation failed (${res.status}).`;
          throw new Error(message);
        }
        const slide = slideResponseSchema.parse((body as { slide?: unknown })?.slide);
        commit(applySlideResponse(deckRef.current, slide, newId, targetId));
        setNotice(null);
      } catch (err) {
        const fallback = fallbackSlide(recentTranscript);
        if (fallback) commit(applySlideResponse(deckRef.current, fallback, newId));
        const reason = err instanceof Error ? err.message : "Slide generation failed.";
        setNotice(`${reason} Showing your transcript as a slide instead.`);
      } finally {
        inFlightRef.current = false;
        setGenerating(false);
      }
    },
    [commit],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const pending = segmentsRef.current.filter((s) => !consumedRef.current.has(s.id) && cleanedRef.current.has(s.id));
      const text = pending.map((s) => cleanedRef.current.get(s.id) ?? "").join(" ").trim();
      if (pending.length > 0 && !text) {
        pending.forEach((s) => consumedRef.current.add(s.id));
        return;
      }
      const decide = shouldRequestSlide({
        pendingText: text,
        inFlight: inFlightRef.current,
        listening: listeningRef.current,
        now: Date.now(),
        lastRequestAt: lastRequestAtRef.current,
        lastSegmentAt: lastSegmentAtRef.current,
      });
      if (decide) void requestSlide(pending.map((s) => s.id), text.slice(-MAX_TRANSCRIPT_CHARS));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [requestSlide]);

  const reset = useCallback(() => {
    consumedRef.current = new Set(segmentsRef.current.map((s) => s.id));
    lastRequestAtRef.current = null;
    commit(EMPTY_DECK);
    setNotice(null);
    setLastCommand(null);
  }, [commit]);

  return {
    deck,
    generating,
    notice,
    lastCommand,
    next: () => commit(goToSlide(deckRef.current, deckRef.current.activeIndex + 1)),
    prev: () => commit(goToSlide(deckRef.current, deckRef.current.activeIndex - 1)),
    reset,
  };
}
