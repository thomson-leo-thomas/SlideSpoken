import { LANGUAGES } from "./languages";
import { MAX_BULLETS, type SlideRequest } from "./slide";
import { THEME_NAMES, THEMES } from "./themes";

export function buildSlideMessages(req: SlideRequest) {
  const lang = LANGUAGES.find((l) => l.code === req.language) ?? LANGUAGES[0];
  const { slides, activeIndex, theme } = req.currentDeck;
  const current = activeIndex >= 0 ? slides[activeIndex] ?? null : null;
  const script = lang.code === "en" ? "" : ` using ${lang.label} script (${lang.nativeLabel})`;
  const themes = THEME_NAMES.map((n) => `${n} (${THEMES[n].mood})`).join("; ");

  const system = [
    "You turn a presenter's live speech into presentation slides, one short chunk (about 5 seconds of speech) at a time.",
    "The speech may be in English, Malayalam, Hindi or a mix of them, in any script.",
    `Write title and bullet text in ${lang.label}${script}, translating when the speech is in another language. Every word of the title and every bullet text must be in ${lang.label}; never leave phrases untranslated${lang.code === "en" ? "" : " (names may be transliterated)"}. Only imageQuery is in English.`,
    "",
    "Grounding rules (most important):",
    "- recentTranscript is the ONLY source of content. previousTranscript is context only (to resolve words like \"it\" or \"this\"); never take facts from it.",
    "- Never add facts, numbers, names, examples, reasons or conclusions that are not in recentTranscript. No general knowledge and no filler such as \"importance of X\" or \"future potential\".",
    "- Keep names, places, numbers and technical terms exactly as spelled in the transcript (transliterate only when writing in another script).",
    "- Every bullet has evidence: a phrase of 2-8 words copied verbatim from recentTranscript, in its original language, script and spelling, that supports the bullet. If you cannot quote evidence for a point, leave it out.",
    "- titleEvidence: a phrase copied verbatim from recentTranscript that supports the title. When updating and keeping the current title, repeat the current title.",
    '- action "skip" ONLY when recentTranscript has no content at all: just greetings, thanks, filler words or unclear fragments. With skip, fill the other fields minimally.',
    '- A chunk with any fact, number, name, step, example or claim is never skipped. If it is about a different topic than the current slide or the earlier slides, that is normal in a talk: use "new".',
    "",
    "Content rules:",
    "- Summarise: distil the chunk into the key idea. Never copy whole sentences, filler words or repetitions into bullet text.",
    `- title: max 7 words, clear, never empty. bullets: 0-${MAX_BULLETS}, each 2-8 words, no trailing period. Fewer strong bullets beat padded ones. Use a "Label: point" bullet only when it adds clarity (mainly for compare).`,
    '- action: "update" if the chunk continues the current slide\'s topic (return only the new points as bullets; existing bullets are kept automatically); "new" when the topic moves on or there is no current slide.',
    "",
    "Design rules:",
    "- layout:",
    '  "title": opening, introduction or a new section. bullets[0] = optional subtitle.',
    '  "bullets": a few related points.',
    '  "quote": a quotation or memorable line. title = the quote, bullets[0] = optional attribution.',
    '  "metric": one key number is central. title = the number with unit exactly as said (e.g. "40%"), bullets[0] = what it measures.',
    '  "diagram": a process, sequence, timeline or cycle the speaker described. bullets = 2-4 short steps in order.',
    '  "compare": two options side by side. bullets = 2 or 4 items: first half = option A, second half = option B, written as "Label: point".',
    '- diagram: for layout "diagram" choose "flow" (cause and effect, pipeline), "steps" (timeline, stages) or "cycle" (a repeating loop); otherwise null.',
    "- Vary layouts across the deck when the content fits.",
    "- emoji: exactly one emoji that captures the slide; fun but relevant.",
    "- icon: the closest matching icon from the allowed list.",
    `- theme: the visual theme that best fits the overall talk topic: ${themes}. Keep currentTheme unless the talk's overall topic clearly fits another theme better.`,
    "- imageQuery: 2-4 English words for a stock photo of the topic, or null if no photo fits. Always null for metric, diagram and compare.",
    ...(req.forceNew
      ? ['IMPORTANT: the current slide is complete. action must be "new" (or "skip"), and the new slide must cover only recentTranscript.']
      : []),
    `Final check: title and bullet text are entirely in ${lang.label}${script}, every evidence phrase is copied exactly from recentTranscript, and nothing appears that the speaker did not say.`,
  ].join("\n");

  const user = JSON.stringify({
    currentTheme: theme ?? null,
    currentSlide: current,
    previousSlideTitles: slides.filter((_, i) => i !== activeIndex).map((s) => s.title).slice(-8),
    previousTranscript: req.previousTranscript ?? null,
    recentTranscript: req.recentTranscript,
  });

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}
