import { z } from "zod";

export const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", speechLocale: "en-US" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം", speechLocale: "ml-IN" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", speechLocale: "hi-IN" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const languageSchema = z.enum(["en", "ml", "hi"]);

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function speechLocaleFor(code: LanguageCode): string {
  return LANGUAGES.find((l) => l.code === code)?.speechLocale ?? "en-US";
}
