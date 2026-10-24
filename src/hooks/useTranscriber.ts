"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHUNK_MS, MIN_AUDIO_BYTES, extensionForMimeType, pickRecorderMimeType } from "@/lib/audio";
import { speechLocaleFor, type LanguageCode } from "@/lib/languages";
import { transcribeResponseSchema } from "@/lib/transcribe";
import { getSpeechRecognition, type SpeechRecognitionLike } from "@/lib/speech";

export type TranscriptSource = "openai" | "browser";

export interface TranscriptSegment {
  id: number;
  text: string;
  source: TranscriptSource;
  language: LanguageCode;
}

export type TranscriberStatus = "idle" | "starting" | "listening" | "error";

interface State {
  status: TranscriberStatus;
  mode: TranscriptSource;
  segments: TranscriptSegment[];
  interim: string;
  pendingChunks: number;
  error: string | null;
  notice: string | null;
}

const INITIAL: State = {
  status: "idle",
  mode: "openai",
  segments: [],
  interim: "",
  pendingChunks: 0,
  error: null,
  notice: null,
};

export function useTranscriber(language: LanguageCode) {
  const [state, setState] = useState<State>(INITIAL);
  const languageRef = useRef(language);
  const listeningRef = useRef(false);
  const modeRef = useRef<TranscriptSource>("openai");
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const seqRef = useRef(0);

  const addSegment = useCallback((seq: number, text: string, source: TranscriptSource, lang: LanguageCode) => {
    const clean = text.trim();
    if (!clean) return;
    setState((s) => {
      const segments = [...s.segments, { id: seq, text: clean, source, language: lang }];
      segments.sort((a, b) => a.id - b.id);
      return { ...s, segments };
    });
  }, []);

  const stopRecorder = useCallback(() => {
    if (chunkTimerRef.current) clearTimeout(chunkTimerRef.current);
    chunkTimerRef.current = null;
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onend = null;
      recognition.abort();
    }
    setState((s) => ({ ...s, interim: "" }));
  }, []);

  const startRecognition = useCallback(() => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      listeningRef.current = false;
      setState((s) => ({
        ...s,
        status: "error",
        error: "Transcription failed and this browser has no speech recognition fallback. Try Chrome or Edge.",
      }));
      return;
    }
    const recognition = new Recognition();
    const lang = languageRef.current;
    recognition.lang = speechLocaleFor(lang);
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) addSegment(seqRef.current++, result[0].transcript, "browser", lang);
        else interim += result[0].transcript;
      }
      setState((s) => ({ ...s, interim }));
    };
    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      setState((s) => ({ ...s, error: `Browser speech recognition error: ${event.error}` }));
    };
    recognition.onend = () => {
      if (listeningRef.current && modeRef.current === "browser" && recognitionRef.current === recognition) {
        recognition.start();
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [addSegment]);

  const fallBackToBrowser = useCallback(
    (reason: string) => {
      if (modeRef.current === "browser" || !listeningRef.current) return;
      modeRef.current = "browser";
      stopRecorder();
      setState((s) => ({
        ...s,
        mode: "browser",
        notice: `${reason} Switched to browser speech recognition.`,
      }));
      startRecognition();
    },
    [startRecognition, stopRecorder],
  );

  const sendChunk = useCallback(
    async (blob: Blob, mimeType: string, seq: number, lang: LanguageCode) => {
      setState((s) => ({ ...s, pendingChunks: s.pendingChunks + 1 }));
      try {
        const form = new FormData();
        form.append("audio", new File([blob], `chunk-${seq}.${extensionForMimeType(mimeType)}`, { type: mimeType }));
        form.append("language", lang);
        const res = await fetch("/api/transcribe", { method: "POST", body: form });
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const message =
            body && typeof body === "object" && "error" in body && typeof body.error === "string"
              ? body.error
              : `Transcription failed (${res.status}).`;
          throw new Error(message);
        }
        const parsed = transcribeResponseSchema.parse(body);
        addSegment(seq, parsed.text, "openai", lang);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Transcription failed.";
        fallBackToBrowser(message);
      } finally {
        setState((s) => ({ ...s, pendingChunks: Math.max(0, s.pendingChunks - 1) }));
      }
    },
    [addSegment, fallBackToBrowser],
  );

  // Each chunk is recorded by its own MediaRecorder so every blob is a complete, decodable file.
  const recordChunk = useCallback(
    (stream: MediaStream, mimeType: string | undefined) => {
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const parts: Blob[] = [];
      const seq = seqRef.current++;
      const lang = languageRef.current;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) parts.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(parts, { type });
        if (blob.size >= MIN_AUDIO_BYTES && modeRef.current === "openai") void sendChunk(blob, type, seq, lang);
        if (listeningRef.current && modeRef.current === "openai" && streamRef.current === stream) {
          recordChunk(stream, mimeType);
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      chunkTimerRef.current = setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, CHUNK_MS);
    },
    [sendChunk],
  );

  const start = useCallback(async () => {
    if (listeningRef.current) return;
    listeningRef.current = true;
    modeRef.current = "openai";
    setState((s) => ({ ...s, status: "starting", mode: "openai", error: null, notice: null }));

    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      modeRef.current = "browser";
      setState((s) => ({ ...s, status: "listening", mode: "browser", notice: "Audio recording is not supported here. Using browser speech recognition." }));
      startRecognition();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!listeningRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      setState((s) => ({ ...s, status: "listening" }));
      recordChunk(stream, pickRecorderMimeType((t) => MediaRecorder.isTypeSupported(t)));
    } catch (error) {
      listeningRef.current = false;
      const denied = error instanceof DOMException && error.name === "NotAllowedError";
      setState((s) => ({
        ...s,
        status: "error",
        error: denied ? "Microphone access was denied. Allow it in your browser settings and try again." : "Could not access the microphone.",
      }));
    }
  }, [recordChunk, startRecognition]);

  const stop = useCallback(() => {
    listeningRef.current = false;
    stopRecorder();
    stopRecognition();
    setState((s) => ({ ...s, status: s.status === "error" ? "error" : "idle" }));
  }, [stopRecognition, stopRecorder]);

  const clear = useCallback(() => {
    setState((s) => ({ ...s, segments: [], interim: "", error: null, notice: null }));
  }, []);

  useEffect(() => {
    languageRef.current = language;
    if (listeningRef.current && modeRef.current === "browser") {
      stopRecognition();
      startRecognition();
    }
  }, [language, startRecognition, stopRecognition]);

  useEffect(() => () => {
    listeningRef.current = false;
    stopRecorder();
    stopRecognition();
  }, [stopRecognition, stopRecorder]);

  return { ...state, isListening: state.status === "listening" || state.status === "starting", start, stop, clear };
}
