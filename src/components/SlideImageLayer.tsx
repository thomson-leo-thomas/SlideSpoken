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
        style={{ opacity: loaded ? 0.35 : 0 }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f1220] via-[#0f1220]/80 to-[#0f1220]/30" />
      {loaded && image.photographer && (
        <a
          href={image.photographerUrl ?? "https://www.pexels.com"}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-[1cqw] right-[1.5cqw] z-10 text-white/40 hover:text-white/70"
          style={{ fontSize: "1cqw" }}
        >
          Photo: {image.photographer} / Pexels
        </a>
      )}
    </>
  );
}
