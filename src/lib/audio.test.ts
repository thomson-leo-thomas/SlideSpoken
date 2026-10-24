import { describe, expect, it } from "vitest";
import { extensionForMimeType, pickRecorderMimeType } from "./audio";
import { CHUNK_MS, MIN_CHUNK_MS, SILENCE_CUT_MS, rmsLevel, shouldCutChunk } from "./audio";

describe("pickRecorderMimeType", () => {
  it("prefers webm/opus when supported", () => {
    expect(pickRecorderMimeType(() => true)).toBe("audio/webm;codecs=opus");
  });
  it("falls back to mp4 for Safari-like browsers", () => {
    expect(pickRecorderMimeType((t) => t === "audio/mp4")).toBe("audio/mp4");
  });
  it("returns undefined when nothing is supported", () => {
    expect(pickRecorderMimeType(() => false)).toBeUndefined();
  });
});

describe("extensionForMimeType", () => {
  it.each([
    ["audio/webm;codecs=opus", "webm"],
    ["audio/mp4", "mp4"],
    ["audio/ogg; codecs=opus", "ogg"],
    ["audio/mpeg", "mp3"],
    ["application/unknown", "webm"],
  ])("%s -> %s", (mime, ext) => {
    expect(extensionForMimeType(mime)).toBe(ext);
  });
});

describe("chunk cutting", () => {
  it("computes RMS level", () => {
    expect(rmsLevel([])).toBe(0);
    expect(rmsLevel([0.5, -0.5, 0.5, -0.5])).toBeCloseTo(0.5);
  });
  it("cuts at a pause after the minimum length, and always at the maximum", () => {
    expect(shouldCutChunk(MIN_CHUNK_MS - 1, 1000)).toBe(false);
    expect(shouldCutChunk(MIN_CHUNK_MS, SILENCE_CUT_MS)).toBe(true);
    expect(shouldCutChunk(4000, 100)).toBe(false);
    expect(shouldCutChunk(CHUNK_MS, 0)).toBe(true);
  });
});
