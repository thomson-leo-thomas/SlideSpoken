export type VoiceCommand = "next" | "back" | "quote" | "title";

// Transliterated variants cover English command words that the transcriber writes in Hindi or Malayalam script.
const PHRASES: Record<VoiceCommand, string[]> = {
  next: ["next slide", "नेक्स्ट स्लाइड", "നെക്സ്റ്റ് സ്ലൈഡ്"],
  back: ["go back", "गो बैक", "ഗോ ബാക്ക്"],
  quote: ["make this a quote", "make it a quote"],
  title: ["add a title slide", "add title slide"],
};

const BOUNDARY_BEFORE = "(?<=^|[\\s\\p{P}])";
const BOUNDARY_AFTER = "(?=$|[\\s\\p{P}])";

function escape(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const MATCHERS = (Object.keys(PHRASES) as VoiceCommand[]).flatMap((command) =>
  PHRASES[command].map((phrase) => ({
    command,
    source: BOUNDARY_BEFORE + phrase.split(/\s+/).map(escape).join("[\\s\\p{P}]+") + BOUNDARY_AFTER,
  })),
);

export interface ParsedCommands {
  commands: VoiceCommand[];
  /** Transcript text with command phrases removed. */
  text: string;
}

export function parseVoiceCommands(input: string): ParsedCommands {
  const found: { command: VoiceCommand; index: number; length: number }[] = [];
  for (const { command, source } of MATCHERS) {
    const re = new RegExp(source, "giu");
    for (const match of input.matchAll(re)) {
      found.push({ command, index: match.index ?? 0, length: match[0].length });
    }
  }
  found.sort((a, b) => a.index - b.index);

  let text = "";
  let cursor = 0;
  const commands: VoiceCommand[] = [];
  for (const f of found) {
    if (f.index < cursor) continue;
    commands.push(f.command);
    text += input.slice(cursor, f.index) + " ";
    cursor = f.index + f.length;
  }
  text += input.slice(cursor);

  const cleaned = text
    .replace(/(^|\s)[.,!?।]+(?=\s|$)/g, "$1")
    .replace(/\s+([.,!?।])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return { commands, text: cleaned };
}
