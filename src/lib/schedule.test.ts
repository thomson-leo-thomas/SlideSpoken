import { describe, expect, it } from "vitest";
import { PAUSE_MS, SLIDE_INTERVAL_MS, shouldRequestSlide, type ScheduleState } from "./schedule";

const base: ScheduleState = {
  pendingText: "some new words",
  inFlight: false,
  listening: true,
  now: 100_000,
  lastRequestAt: 100_000 - 1000,
  lastSegmentAt: 100_000 - 500,
};

describe("shouldRequestSlide", () => {
  it("waits while text is recent and the interval has not elapsed", () => {
    expect(shouldRequestSlide(base)).toBe(false);
  });
  it("requests immediately for the first text", () => {
    expect(shouldRequestSlide({ ...base, lastRequestAt: null })).toBe(true);
  });
  it("requests after the interval", () => {
    expect(shouldRequestSlide({ ...base, lastRequestAt: base.now - SLIDE_INTERVAL_MS })).toBe(true);
  });
  it("requests on a pause in speech", () => {
    expect(shouldRequestSlide({ ...base, lastSegmentAt: base.now - PAUSE_MS })).toBe(true);
  });
  it("flushes pending text when listening stops", () => {
    expect(shouldRequestSlide({ ...base, listening: false })).toBe(true);
  });
  it("never requests without new text or while a request is in flight", () => {
    expect(shouldRequestSlide({ ...base, pendingText: "  ", lastRequestAt: null })).toBe(false);
    expect(shouldRequestSlide({ ...base, inFlight: true, lastRequestAt: null })).toBe(false);
  });
});
