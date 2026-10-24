import { z } from "zod";

export const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", speechLocale: "en-US", titlePlaceholder: "Title" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം", speechLocale: "ml-IN", titlePlaceholder: "തലക്കെട്ട്" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", speechLocale: "hi-IN", titlePlaceholder: "शीर्षक" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const languageSchema = z.enum(["en", "ml", "hi"]);

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function speechLocaleFor(code: LanguageCode): string {
  return LANGUAGES.find((l) => l.code === code)?.speechLocale ?? "en-US";
}

export function titlePlaceholderFor(code: LanguageCode): string {
  return LANGUAGES.find((l) => l.code === code)?.titlePlaceholder ?? "Title";
}

export const AUTO_DETECT = "auto" as const;
/** What the presenter speaks: a specific language, or "auto" to let transcription detect it. */
export const speechLanguageSchema = z.union([languageSchema, z.literal(AUTO_DETECT)]);
export type SpeechLanguage = LanguageCode | typeof AUTO_DETECT;

/** Guesses the language of transcribed text from its script (Malayalam, Devanagari, else English). */
export function detectScriptLanguage(text: string): LanguageCode {
  const count = (re: RegExp) => text.match(re)?.length ?? 0;
  const ml = count(/[\u0D00-\u0D7F]/g);
  const hi = count(/[\u0900-\u097F]/g);
  const en = count(/[A-Za-z]/g);
  if (ml > hi && ml > en) return "ml";
  if (hi > ml && hi > en) return "hi";
  return "en";
}
