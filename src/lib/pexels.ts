import "server-only";
import { NO_IMAGE, type SlideImage } from "./images";

interface PexelsPhoto {
  alt?: string;
  photographer?: string;
  photographer_url?: string;
  src?: { landscape?: string; large?: string };
}

export async function searchPexels(query: string): Promise<SlideImage> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return NO_IMAGE;
  const url = `https://api.pexels.com/v1/search?${new URLSearchParams({ query, per_page: "1", orientation: "landscape" })}`;
  const res = await fetch(url, { headers: { Authorization: key }, signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Pexels responded ${res.status}`);
  const data = (await res.json()) as { photos?: PexelsPhoto[] };
  const photo = data.photos?.[0];
  const src = photo?.src?.landscape ?? photo?.src?.large;
  if (!src) return NO_IMAGE;
  return {
    url: src,
    alt: photo?.alt || query,
    photographer: photo?.photographer,
    photographerUrl: photo?.photographer_url,
  };
}
