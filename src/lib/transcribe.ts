import { z } from "zod";
import { MAX_AUDIO_BYTES, MIN_AUDIO_BYTES } from "./audio";
import { speechLanguageSchema, type SpeechLanguage } from "./languages";

export const transcribeResponseSchema = z.object({ text: z.string() });
export type TranscribeResponse = z.infer<typeof transcribeResponseSchema>;

export type TranscribeInput =
  | { ok: true; audio: File; language: SpeechLanguage }
  | { ok: false; status: number; error: string };

export function parseTranscribeForm(form: FormData): TranscribeInput {
  const language = speechLanguageSchema.safeParse(form.get("language"));
  if (!language.success) {
    return { ok: false, status: 400, error: "Unsupported language." };
  }
  const audio = form.get("audio");
  if (!(audio instanceof File)) {
    return { ok: false, status: 400, error: "Missing audio file." };
  }
  if (audio.size < MIN_AUDIO_BYTES) {
    return { ok: false, status: 400, error: "Audio chunk is too small." };
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return { ok: false, status: 413, error: "Audio chunk is too large." };
  }
  return { ok: true, audio, language: language.data };
}
