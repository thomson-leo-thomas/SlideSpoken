// Generates the voice-over clips with OpenAI text-to-speech (AI voice).
// Needs OPENAI_API_KEY (read from the environment or ../.env.local). Output: public/audio/vo-<n>.mp3
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { LINES } from "./voiceover-lines.mjs";

function apiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const envFile = new URL("../../.env.local", import.meta.url);
  if (existsSync(envFile)) {
    const line = readFileSync(envFile, "utf8").split("\n").find((l) => l.startsWith("OPENAI_API_KEY="));
    if (line) return line.slice("OPENAI_API_KEY=".length).trim();
  }
  throw new Error("OPENAI_API_KEY is not set (env or ../.env.local).");
}

const key = apiKey();
for (const [i, text] of LINES.entries()) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: "nova",
      input: text,
      response_format: "mp3",
      instructions: "Confident, warm tech-creator voice. Energetic but clear, natural pace, short pauses at commas.",
    }),
  });
  if (!res.ok) throw new Error(`TTS failed for line ${i + 1}: ${res.status} ${await res.text()}`);
  const out = new URL(`../public/audio/vo-${i + 1}.mp3`, import.meta.url);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log(`vo-${i + 1}.mp3  ${text}`);
}
