import { describe, expect, it } from "vitest";
import { buildSlideMessages } from "./prompt";

describe("buildSlideMessages", () => {
  it("asks for slide text in the selected language and includes the current slide", () => {
    const [system, user] = buildSlideMessages({
      recentTranscript: "ഇന്ന് നമ്മൾ സൗരോർജ്ജത്തെക്കുറിച്ച് സംസാരിക്കും",
      currentDeck: { slides: [{ title: "Intro", bullets: [], layout: "title" }], activeIndex: 0 },
      language: "ml",
    });
    expect(system.content).toContain("Malayalam");
    expect(system.content).toContain("മലയാളം");
    const payload = JSON.parse(user.content);
    expect(payload.currentSlide.title).toBe("Intro");
    expect(payload.recentTranscript).toContain("സൗരോർജ്ജ");
  });
  it("sends no current slide for an empty deck", () => {
    const [, user] = buildSlideMessages({ recentTranscript: "hi", currentDeck: { slides: [], activeIndex: -1 }, language: "en" });
    expect(JSON.parse(user.content).currentSlide).toBeNull();
  });
});

describe("forceNew", () => {
  it("tells the model to start a new slide only when asked", () => {
    const base = { recentTranscript: "More points", currentDeck: { slides: [], activeIndex: -1 }, language: "en" as const };
    expect(buildSlideMessages({ ...base, forceNew: true })[0].content).toContain('action must be "new"');
    expect(buildSlideMessages(base)[0].content).not.toContain('action must be "new"');
  });
});

describe("grounding instructions", () => {
  it("sends the previous chunk as context only and asks for evidence", () => {
    const [system, user] = buildSlideMessages({
      recentTranscript: "Costs fell by forty percent",
      previousTranscript: "Solar panels doubled",
      currentDeck: { slides: [], activeIndex: -1 },
      language: "en",
    });
    expect(system.content).toContain("context only");
    expect(system.content).toContain("evidence");
    expect(system.content).toContain('"skip"');
    expect(JSON.parse(user.content).previousTranscript).toBe("Solar panels doubled");
  });
});
