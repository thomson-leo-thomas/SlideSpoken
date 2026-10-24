import { describe, expect, it } from "vitest";
import { MAX_AUDIO_BYTES } from "./audio";
import { parseTranscribeForm } from "./transcribe";

function form(language: string | null, bytes: number | null) {
  const f = new FormData();
  if (language !== null) f.append("language", language);
  if (bytes !== null) f.append("audio", new File([new Uint8Array(bytes)], "chunk.webm", { type: "audio/webm" }));
  return f;
}

describe("parseTranscribeForm", () => {
  it.each(["en", "ml", "hi", "auto"])("accepts language %s", (lang) => {
    const result = parseTranscribeForm(form(lang, 4096));
    expect(result.ok).toBe(true);
  });
  it("rejects unsupported languages", () => {
    expect(parseTranscribeForm(form("fr", 4096))).toMatchObject({ ok: false, status: 400 });
  });
  it("rejects missing audio", () => {
    expect(parseTranscribeForm(form("en", null))).toMatchObject({ ok: false, status: 400 });
  });
  it("rejects tiny chunks", () => {
    expect(parseTranscribeForm(form("en", 10))).toMatchObject({ ok: false, status: 400 });
  });
  it("rejects oversized chunks", () => {
    expect(parseTranscribeForm(form("en", MAX_AUDIO_BYTES + 1))).toMatchObject({ ok: false, status: 413 });
  });
});
