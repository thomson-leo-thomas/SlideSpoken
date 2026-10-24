import { NextResponse } from "next/server";
import { getOpenAI, MissingApiKeyError, TRANSCRIBE_MODEL } from "@/lib/openai";
import { parseTranscribeForm } from "@/lib/transcribe";

export const runtime = "nodejs";

const AUTO_DETECT_PROMPT =
  "The speaker may use English, Malayalam or Hindi, sometimes mixed. Transcribe in the original language and script.";

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const input = parseTranscribeForm(form);
  if (!input.ok) {
    return NextResponse.json({ error: input.error }, { status: input.status });
  }

  try {
    const result = await getOpenAI().audio.transcriptions.create({
      file: input.audio,
      model: TRANSCRIBE_MODEL,
      ...(input.language === "auto" ? { prompt: AUTO_DETECT_PROMPT } : { language: input.language }),
      response_format: "json",
    });
    return NextResponse.json({ text: result.text.trim() });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Transcription failed", error);
    return NextResponse.json({ error: "Transcription failed." }, { status: 502 });
  }
}
