import "server-only";
import OpenAI from "openai";

export const TRANSCRIBE_MODEL = "gpt-4o-mini-transcribe";

let client: OpenAI | null = null;

export class MissingApiKeyError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not configured on the server.");
  }
}

export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();
  client ??= new OpenAI({ apiKey });
  return client;
}

export const SLIDE_MODEL = "gpt-4o-mini";
