import { NextResponse } from "next/server";
import { getOpenAI, MissingApiKeyError, SLIDE_MODEL } from "@/lib/openai";
import { buildSlideMessages } from "@/lib/prompt";
import { parseSlideResponse, SLIDE_JSON_SCHEMA, slideRequestSchema } from "@/lib/slide";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = slideRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid slide request." }, { status: 400 });
  }

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: SLIDE_MODEL,
      temperature: 0.3,
      max_tokens: 400,
      messages: buildSlideMessages(parsed.data),
      response_format: {
        type: "json_schema",
        json_schema: { name: "slide", strict: true, schema: SLIDE_JSON_SCHEMA },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty model response");
    const slide = parseSlideResponse(JSON.parse(content));
    if (!slide.success) {
      console.error("Slide failed validation", slide.error.issues);
      return NextResponse.json({ error: "The model returned an invalid slide." }, { status: 502 });
    }
    return NextResponse.json({ slide: slide.data });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Slide generation failed", error);
    return NextResponse.json({ error: "Slide generation failed." }, { status: 502 });
  }
}
