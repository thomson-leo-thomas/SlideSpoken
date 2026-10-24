import { NextResponse } from "next/server";
import { imageQuerySchema, NO_IMAGE } from "@/lib/images";
import { searchPexels } from "@/lib/pexels";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const query = imageQuerySchema.safeParse(new URL(request.url).searchParams.get("query"));
  if (!query.success) {
    return NextResponse.json({ error: "Invalid image query." }, { status: 400 });
  }
  try {
    return NextResponse.json(await searchPexels(query.data));
  } catch (error) {
    console.error("Image search failed", error);
    return NextResponse.json(NO_IMAGE);
  }
}
