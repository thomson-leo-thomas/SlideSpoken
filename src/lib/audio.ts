/** Chunks are cut at the first short pause after MIN_CHUNK_MS, and always by CHUNK_MS (6 s). */
export const CHUNK_MS = 6000;
export const MIN_CHUNK_MS = 2500;
export const SILENCE_CUT_MS = 400;
export const LEVEL_TICK_MS = 100;
/** RMS level above which a frame counts as speech. */
export const VOICE_LEVEL = 0.015;
/** Chunks with less speech than this are not uploaded (avoids transcribing silence). */
export const MIN_VOICED_MS = 300;
export const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
export const MIN_AUDIO_BYTES = 1024;

const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
];

export function pickRecorderMimeType(
  isSupported: (type: string) => boolean,
): string | undefined {
  return PREFERRED_MIME_TYPES.find((type) => isSupported(type));
}

export function extensionForMimeType(mimeType: string): string {
  const base = mimeType.split(";")[0].trim().toLowerCase();
  switch (base) {
    case "audio/webm":
    case "video/webm":
      return "webm";
    case "audio/mp4":
    case "audio/x-m4a":
    case "audio/m4a":
    case "video/mp4":
      return "mp4";
    case "audio/ogg":
      return "ogg";
    case "audio/mpeg":
    case "audio/mp3":
      return "mp3";
    case "audio/wav":
    case "audio/x-wav":
      return "wav";
    default:
      return "webm";
  }
}

export function rmsLevel(samples: ArrayLike<number>): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

export function shouldCutChunk(elapsedMs: number, silentForMs: number): boolean {
  if (elapsedMs >= CHUNK_MS) return true;
  return elapsedMs >= MIN_CHUNK_MS && silentForMs >= SILENCE_CUT_MS;
}
