import { describe, expect, it } from "vitest";
import { displayDelay, MIN_DISPLAY_MS, shouldRequestSlide, type ScheduleState } from "./schedule";

const base: ScheduleState = { pendingText: "solar panels doubled in three years here", inFlight: false, listening: true };

describe("shouldRequestSlide", () => {
  it("requests once a chunk has enough words", () => {
    expect(shouldRequestSlide(base)).toBe(true);
  });
  it("carries short chunks over to the next one", () => {
    expect(shouldRequestSlide({ ...base, pendingText: "and then we" })).toBe(false);
  });
  it("flushes short leftover text when listening stops", () => {
    expect(shouldRequestSlide({ ...base, pendingText: "thank you", listening: false })).toBe(true);
  });
  it("never requests without text or while a request is in flight", () => {
    expect(shouldRequestSlide({ ...base, pendingText: "  " })).toBe(false);
    expect(shouldRequestSlide({ ...base, inFlight: true })).toBe(false);
  });
});

describe("displayDelay", () => {
  it("shows the first slide immediately", () => {
    expect(displayDelay(10_000, null)).toBe(0);
  });
  it("holds a ready slide until the current one has been up for the minimum time", () => {
    expect(displayDelay(10_000, 9_000)).toBe(MIN_DISPLAY_MS - 1000);
    expect(displayDelay(10_000, 10_000 - MIN_DISPLAY_MS)).toBe(0);
    expect(displayDelay(20_000, 1_000)).toBe(0);
  });
});
