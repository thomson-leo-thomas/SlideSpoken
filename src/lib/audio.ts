export const CHUNK_MS = 6000;
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
