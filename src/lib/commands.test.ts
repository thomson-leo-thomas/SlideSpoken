import { describe, expect, it } from "vitest";
import { parseVoiceCommands } from "./commands";

describe("parseVoiceCommands", () => {
  it("detects each command and removes it from the text", () => {
    expect(parseVoiceCommands("That covers costs. Next slide. Now benefits")).toEqual({
      commands: ["next"],
      text: "That covers costs. Now benefits",
    });
    expect(parseVoiceCommands("Go back, please").commands).toEqual(["back"]);
    expect(parseVoiceCommands("make this a quote").commands).toEqual(["quote"]);
    expect(parseVoiceCommands("Add a title slide!").commands).toEqual(["title"]);
  });
  it("is case and punctuation tolerant", () => {
    expect(parseVoiceCommands("NEXT, SLIDE").commands).toEqual(["next"]);
    expect(parseVoiceCommands("make this... a quote").commands).toEqual(["quote"]);
  });
  it("keeps multiple commands in spoken order", () => {
    expect(parseVoiceCommands("go back. make this a quote. next slide").commands).toEqual(["back", "quote", "next"]);
  });
  it("ignores phrases inside other words", () => {
    expect(parseVoiceCommands("the nextslide is fine").commands).toEqual([]);
    expect(parseVoiceCommands("ago backwards").commands).toEqual([]);
  });
  it("returns plain text untouched when there are no commands", () => {
    expect(parseVoiceCommands("Solar energy is growing fast.")).toEqual({ commands: [], text: "Solar energy is growing fast." });
  });
  it("detects transliterated commands in Hindi and Malayalam script", () => {
    expect(parseVoiceCommands("अब नेक्स्ट स्लाइड।").commands).toEqual(["next"]);
    expect(parseVoiceCommands("ശരി, നെക്സ്റ്റ് സ്ലൈഡ്").commands).toEqual(["next"]);
    expect(parseVoiceCommands("ഗോ ബാക്ക്").commands).toEqual(["back"]);
  });
  it("leaves empty text when the segment is only a command", () => {
    expect(parseVoiceCommands("Next slide.").text).toBe("");
  });
});
