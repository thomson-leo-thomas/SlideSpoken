import { describe, expect, it } from "vitest";
import { extensionForMimeType, pickRecorderMimeType } from "./audio";

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
