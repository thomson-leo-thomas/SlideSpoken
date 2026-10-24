"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseVoiceCommands, type VoiceCommand } from "@/lib/commands";
import { addTitleSlide, applySlideResponse, goToSlide, makeQuote } from "@/lib/deck";
import { fallbackSlide } from "@/lib/fallback";
import { titlePlaceholderFor, type LanguageCode } from "@/lib/languages";
import { shouldForceNew } from "@/lib/live";
import { displayDelay, shouldRequestSlide } from "@/lib/schedule";
import { deckContext, EMPTY_DECK, MAX_TRANSCRIPT_CHARS, slideResponseSchema, type Deck } from "@/lib/slide";
import type { TranscriptSegment } from "./useTranscriber";

const TICK_MS = 250;
const PREVIOUS_CHARS = 600;

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Turns each transcribed chunk into a slide in the background. Short chunks are carried into the next one,
 * and a ready slide is held until the current one has been on screen for MIN_DISPLAY_MS.
 */
export function useSlideGenerator(segments: TranscriptSegment[], listening: boolean, language: LanguageCode) {
  const [deck, setDeck] = useState<Deck>(EMPTY_DECK);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<{ command: VoiceCommand; at: number } | null>(null);

  const deckRef = useRef(deck);
  const cleanedRef = useRef(new Map<number, string>());
  const consumedRef = useRef(new Set<number>());
  const inFlightRef = useRef(false);
  const updatesRef = useRef(new Map<string, number>());
  const previousRef = useRef("");
  const lastShownAtRef = useRef<number | null>(null);
  const displayChainRef = useRef<Promise<void>>(Promise.resolve());
  const epochRef = useRef(0);
  const segmentsRef = useRef(segments);
  const listeningRef = useRef(listening);
  const languageRef = useRef(language);

  const commit = useCallback((next: Deck) => {
    deckRef.current = next;
    setDeck(next);
  }, []);

  /** Queues a deck change so each slide stays visible for at least MIN_DISPLAY_MS. */
  const show = useCallback(
    (change: () => Deck) => {
      const epoch = epochRef.current;
      displayChainRef.current = displayChainRef.current.then(async () => {
        const wait = displayDelay(Date.now(), lastShownAtRef.current);
        if (wait > 0) await sleep(wait);
        if (epoch !== epochRef.current) return;
        commit(change());
        lastShownAtRef.current = Date.now();
      });
    },
    [commit],
  );

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
    for (const segment of segments) {
      if (cleanedRef.current.has(segment.id)) continue;
      const { commands, text } = parseVoiceCommands(segment.text);
      cleanedRef.current.set(segment.id, text);
      commands.forEach(runCommand);
    }
    segmentsRef.current = segments;
  }, [segments, runCommand]);

  useEffect(() => {
    listeningRef.current = listening;
    languageRef.current = language;
  }, [listening, language]);

  const requestSlide = useCallback(
    async (ids: number[], recentTranscript: string) => {
      ids.forEach((id) => consumedRef.current.add(id));
      const previousTranscript = previousRef.current;
      previousRef.current = recentTranscript.slice(-PREVIOUS_CHARS);
      const current = deckRef.current.slides[deckRef.current.activeIndex];
      const targetId = current?.id;
      const forceNew = shouldForceNew(current, targetId ? (updatesRef.current.get(targetId) ?? 0) : 0);
      inFlightRef.current = true;
      setGenerating(true);
      try {
        const res = await fetch("/api/slide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recentTranscript,
            ...(previousTranscript ? { previousTranscript } : {}),
            currentDeck: deckContext(deckRef.current),
            language: languageRef.current,
            ...(forceNew ? { forceNew: true } : {}),
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
        setNotice(null);
        const raw = (body as { slide?: unknown } | null)?.slide;
        if (raw == null) return; // skipped: nothing slide-worthy in this chunk
        const slide = slideResponseSchema.parse(raw);
        if (forceNew) slide.action = "new";
        if (slide.action === "update" && targetId) {
          updatesRef.current.set(targetId, (updatesRef.current.get(targetId) ?? 0) + 1);
        }
        show(() => applySlideResponse(deckRef.current, slide, newId, targetId));
      } catch (err) {
        const fallback = fallbackSlide(recentTranscript);
        if (fallback) show(() => applySlideResponse(deckRef.current, fallback, newId));
        const reason = err instanceof Error ? err.message : "Slide generation failed.";
        setNotice(`${reason} Showing your transcript as a slide instead.`);
      } finally {
        inFlightRef.current = false;
        setGenerating(false);
      }
    },
    [show],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const pending = segmentsRef.current.filter((s) => !consumedRef.current.has(s.id) && cleanedRef.current.has(s.id));
      const text = pending.map((s) => cleanedRef.current.get(s.id) ?? "").join(" ").trim();
      if (pending.length > 0 && !text) {
        pending.forEach((s) => consumedRef.current.add(s.id));
        return;
      }
      const decide = shouldRequestSlide({ pendingText: text, inFlight: inFlightRef.current, listening: listeningRef.current });
      if (decide) void requestSlide(pending.map((s) => s.id), text.slice(-MAX_TRANSCRIPT_CHARS));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [requestSlide]);

  const reset = useCallback(() => {
    consumedRef.current = new Set(segmentsRef.current.map((s) => s.id));
    epochRef.current += 1;
    lastShownAtRef.current = null;
    previousRef.current = "";
    updatesRef.current.clear();
    commit(EMPTY_DECK);
    setNotice(null);
    setLastCommand(null);
  }, [commit]);

  const goTo = useCallback((index: number) => commit(goToSlide(deckRef.current, index)), [commit]);
  const next = useCallback(() => commit(goToSlide(deckRef.current, deckRef.current.activeIndex + 1)), [commit]);
  const prev = useCallback(() => commit(goToSlide(deckRef.current, deckRef.current.activeIndex - 1)), [commit]);

  return { deck, generating, notice, lastCommand, goTo, next, prev, reset };
}
