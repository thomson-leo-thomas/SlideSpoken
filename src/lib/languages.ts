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
