"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { applySlideResponse, goToSlide } from "@/lib/deck";
import type { LanguageCode } from "@/lib/languages";
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
  const [error, setError] = useState<string | null>(null);

  const deckRef = useRef(deck);
  const consumedRef = useRef(new Set<number>());
  const inFlightRef = useRef(false);
  const lastRequestAtRef = useRef<number | null>(null);
  const lastSegmentAtRef = useRef<number | null>(null);
  const segmentsRef = useRef(segments);
  const listeningRef = useRef(listening);
  const languageRef = useRef(language);

  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);

  useEffect(() => {
    if (segments.length > segmentsRef.current.length) lastSegmentAtRef.current = Date.now();
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    listeningRef.current = listening;
    languageRef.current = language;
  }, [listening, language]);

  const requestSlide = useCallback(async (pending: TranscriptSegment[]) => {
    pending.forEach((s) => consumedRef.current.add(s.id));
    const recentTranscript = pending.map((s) => s.text).join(" ").slice(-MAX_TRANSCRIPT_CHARS);
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
      const next = applySlideResponse(deckRef.current, slide, newId);
      deckRef.current = next;
      setDeck(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Slide generation failed.");
    } finally {
      inFlightRef.current = false;
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const pending = segmentsRef.current.filter((s) => !consumedRef.current.has(s.id));
      const decide = shouldRequestSlide({
        pendingText: pending.map((s) => s.text).join(" "),
        inFlight: inFlightRef.current,
        listening: listeningRef.current,
        now: Date.now(),
        lastRequestAt: lastRequestAtRef.current,
        lastSegmentAt: lastSegmentAtRef.current,
      });
      if (decide) void requestSlide(pending);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [requestSlide]);

  const go = useCallback((index: number) => {
    const next = goToSlide(deckRef.current, index);
    deckRef.current = next;
    setDeck(next);
  }, []);

  const reset = useCallback(() => {
    consumedRef.current = new Set(segmentsRef.current.map((s) => s.id));
    lastRequestAtRef.current = null;
    deckRef.current = EMPTY_DECK;
    setDeck(EMPTY_DECK);
    setError(null);
  }, []);

  return {
    deck,
    generating,
    error,
    next: () => go(deckRef.current.activeIndex + 1),
    prev: () => go(deckRef.current.activeIndex - 1),
    reset,
  };
}
