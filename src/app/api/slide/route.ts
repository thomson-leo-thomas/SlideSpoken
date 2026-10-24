import { NextResponse } from "next/server";
import { groundSlide } from "@/lib/grounding";
import { getOpenAI, MissingApiKeyError, SLIDE_MODEL } from "@/lib/openai";
import { buildSlideMessages } from "@/lib/prompt";
import { countWords, parseSlideResponse, SLIDE_JSON_SCHEMA, slideRequestSchema, type SlideRequest } from "@/lib/slide";

export const runtime = "nodejs";

/** A "skip" on a chunk this long gets a second opinion without the deck, which can bias the model toward skipping topic changes. */
const RECHECK_SKIP_WORDS = 8;

async function generate(req: SlideRequest): Promise<Record<string, unknown>> {
  const completion = await getOpenAI().chat.completions.create({
    model: SLIDE_MODEL,
    temperature: 0.1,
    max_tokens: 500,
    messages: buildSlideMessages(req),
    response_format: {
      type: "json_schema",
      json_schema: { name: "slide", strict: true, schema: SLIDE_JSON_SCHEMA },
    },
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty model response");
  const raw: unknown = JSON.parse(content);
  if (!raw || typeof raw !== "object") throw new Error("Model response is not an object");
  return raw as Record<string, unknown>;
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = slideRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid slide request." }, { status: 400 });
  }
  const req = parsed.data;

  try {
    let raw = await generate(req);
    if (raw.action === "skip" && req.currentDeck.slides.length > 0 && countWords(req.recentTranscript) >= RECHECK_SKIP_WORDS) {
      const fresh = await generate({ ...req, forceNew: false, currentDeck: { ...req.currentDeck, slides: [], activeIndex: -1 } });
      if (fresh.action !== "skip") raw = { ...fresh, action: "new" };
    }
    if (req.forceNew && raw.action === "update") raw = { ...raw, action: "new" };

    const grounded = groundSlide(raw, req);
    if (grounded.kind === "skip") return NextResponse.json({ slide: null, skipped: grounded.reason });
    if (grounded.rejected > 0) console.info(`Dropped ${grounded.rejected} bullet(s) without transcript evidence`);
    const slide = parseSlideResponse(grounded.raw);
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
