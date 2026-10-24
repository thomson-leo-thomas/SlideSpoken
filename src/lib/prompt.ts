import { LANGUAGES } from "./languages";
import { MAX_BULLETS, type SlideRequest } from "./slide";

export function buildSlideMessages(req: SlideRequest) {
  const lang = LANGUAGES.find((l) => l.code === req.language) ?? LANGUAGES[0];
  const { slides, activeIndex } = req.currentDeck;
  const current = activeIndex >= 0 ? slides[activeIndex] ?? null : null;

  const system = [
    `You turn a presenter's live speech into presentation slides. The presenter speaks ${lang.label}.`,
    "Rules:",
    `- Write title and bullets in ${lang.label}${lang.code === "en" ? "" : ` using ${lang.label} script (${lang.nativeLabel})`}. Only imageQuery is in English.`,
    '- action: "update" if the recent speech continues the current slide\'s topic; "new" if the topic changes or there is no current slide.',
    "- For update, return the complete revised slide: keep the useful existing points and merge in the new ones.",
    `- title: short (max 8 words), never empty. bullets: 0-${MAX_BULLETS} items, each max 10 words, no trailing period.`,
    "- Summarise ideas; never copy filler words, repetitions or speech disfluencies.",
    "- layout:",
    '  "title": opening, introductions or a new section. title = heading, bullets[0] = optional subtitle.',
    '  "bullets": several related points. title = heading, bullets = points.',
    '  "quote": the speaker quotes someone or says a memorable line. title = the quote, bullets[0] = optional attribution.',
    '  "metric": one key number is central. title = the number with unit (e.g. "40%"), bullets[0] = what it measures, others = context.',
    '  "diagram": a process, sequence or cause and effect. title = heading, bullets = 2-4 steps in order.',
    "- icon: the closest matching icon from the allowed list.",
    "- imageQuery: 2-4 English words for a stock photo of the topic, or null if no photo fits.",
    "- If the speech is unclear, still return your best concise slide; never an empty one.",
  ].join("\n");

  const user = JSON.stringify({
    currentSlide: current,
    previousSlideTitles: slides.filter((_, i) => i !== activeIndex).map((s) => s.title).slice(-8),
    recentTranscript: req.recentTranscript,
  });

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}
