"use client";

import { Languages } from "lucide-react";
import { LANGUAGES, type LanguageCode } from "@/lib/languages";

interface Props {
  value: LanguageCode;
  onChange: (value: LanguageCode) => void;
}

export function LanguageSelector({ value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-base">
      <Languages className="h-5 w-5 text-white/60" aria-hidden />
      <span className="sr-only">Language</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LanguageCode)}
        className="bg-transparent text-white outline-none"
        aria-label="Language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-neutral-900">
            {l.label} · {l.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
