"use client";

import { useState } from "react";
import type { SlideImage } from "@/lib/images";

export function SlideImageLayer({ image }: { image: SlideImage }) {
  const [loaded, setLoaded] = useState(false);
  if (!image.url) return null;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote Pexels images, loaded in the background */}
      <img
        src={image.url}
        alt={image.alt ?? ""}
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
        style={{ opacity: loaded ? 0.4 : 0 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--s-bg0) 0%, color-mix(in srgb, var(--s-bg0) 82%, transparent) 50%, color-mix(in srgb, var(--s-bg0) 25%, transparent) 100%)",
        }}
      />
      {loaded && image.photographer && (
        <a
          href={image.photographerUrl ?? "https://www.pexels.com"}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-[1cqw] right-[1.5cqw] z-10 text-[var(--s-muted)] opacity-60 hover:opacity-100"
          style={{ fontSize: "1cqw" }}
        >
          Photo: {image.photographer} / Pexels
        </a>
      )}
    </>
  );
}
