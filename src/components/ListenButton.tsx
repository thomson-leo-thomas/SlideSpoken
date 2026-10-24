"use client";

import { Loader2, Mic, Square } from "lucide-react";

interface Props {
  listening: boolean;
  starting: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function ListenButton({ listening, starting, onStart, onStop }: Props) {
  if (listening) {
    return (
      <button
        type="button"
        onClick={onStop}
        className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-lg font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-400"
      >
        {starting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Square className="h-5 w-5" aria-hidden />}
        Stop Listening
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onStart}
      className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-lg font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
    >
      <Mic className="h-5 w-5" aria-hidden />
      Start Listening
    </button>
  );
}
