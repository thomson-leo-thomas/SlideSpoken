import { describe, expect, it } from "vitest";
import { detectScriptLanguage, speechLanguageSchema } from "./languages";

describe("detectScriptLanguage", () => {
  it("detects the script of transcribed text", () => {
    expect(detectScriptLanguage("ഇന്ന് സൗരോർജ്ജം")).toBe("ml");
    expect(detectScriptLanguage("आज सौर ऊर्जा")).toBe("hi");
    expect(detectScriptLanguage("Solar power today")).toBe("en");
    expect(detectScriptLanguage("")).toBe("en");
  });
  it("uses the dominant script in mixed speech", () => {
    expect(detectScriptLanguage("Solar ഇന്ന് സൗരോർജ്ജം വളരുന്നു")).toBe("ml");
  });
});

describe("speechLanguageSchema", () => {
  it("accepts auto and the three languages only", () => {
    for (const v of ["auto", "en", "ml", "hi"]) expect(speechLanguageSchema.safeParse(v).success).toBe(true);
    expect(speechLanguageSchema.safeParse("fr").success).toBe(false);
  });
});
