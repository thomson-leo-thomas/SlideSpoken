import { ArrowRight, Quote } from "lucide-react";
import type { Slide } from "@/lib/slide";
import { SlideIconView } from "./SlideIconView";

const delay = (i: number) => ({ animationDelay: `${120 + i * 110}ms` });

/** Renders one slide. Sizes use container query units so the slide scales with its 16:9 frame. */
export function SlideView({ slide }: { slide: Slide }) {
  const [first, ...rest] = slide.bullets;

  switch (slide.layout) {
    case "title":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-[2.5cqw] px-[8cqw] text-center">
          <div key={slide.icon} className="animate-fade-up rounded-full bg-indigo-500/15 p-[2cqw] text-indigo-300">
            <SlideIconView name={slide.icon} style={{ width: "6cqw", height: "6cqw" }} />
          </div>
          <h2 key={slide.title} className="animate-fade-up font-bold leading-tight" style={{ fontSize: "6.2cqw", ...delay(0) }}>
            {slide.title}
          </h2>
          {first && (
            <p key={first} className="animate-fade-up text-white/70" style={{ fontSize: "2.8cqw", ...delay(1) }}>
              {first}
            </p>
          )}
        </div>
      );

    case "quote":
      return (
        <div className="flex h-full flex-col justify-center gap-[2.5cqw] px-[10cqw]">
          <Quote className="text-indigo-400/70" style={{ width: "7cqw", height: "7cqw" }} aria-hidden />
          <blockquote key={slide.title} className="animate-fade-up font-semibold italic leading-snug" style={{ fontSize: "4.4cqw" }}>
            {slide.title}
          </blockquote>
          {first && (
            <p key={first} className="animate-fade-up text-white/60" style={{ fontSize: "2.4cqw", ...delay(1) }}>
              — {first}
            </p>
          )}
        </div>
      );

    case "metric":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-[1.5cqw] px-[8cqw] text-center">
          <SlideIconView name={slide.icon} className="text-indigo-300" style={{ width: "5cqw", height: "5cqw" }} />
          <p
            key={slide.title}
            className="animate-fade-up bg-gradient-to-br from-indigo-300 to-fuchsia-400 bg-clip-text font-extrabold leading-none text-transparent"
            style={{ fontSize: "12cqw" }}
          >
            {slide.title}
          </p>
          {first && (
            <p key={first} className="animate-fade-up font-medium" style={{ fontSize: "3.2cqw", ...delay(0) }}>
              {first}
            </p>
          )}
          {rest.map((b, i) => (
            <p key={`${i}-${b}`} className="animate-fade-up text-white/60" style={{ fontSize: "2.2cqw", ...delay(i + 1) }}>
              {b}
            </p>
          ))}
        </div>
      );

    case "diagram":
      return (
        <div className="flex h-full flex-col justify-center gap-[4cqw] px-[6cqw]">
          <SlideHeader slide={slide} />
          <div className="flex items-stretch justify-center gap-[1.5cqw]">
            {slide.bullets.map((b, i) => (
              <div key={`${i}-${b}`} className="flex items-center gap-[1.5cqw]">
                {i > 0 && <ArrowRight className="shrink-0 text-indigo-400" style={{ width: "3cqw", height: "3cqw" }} aria-hidden />}
                <div
                  className="animate-fade-up flex h-full items-center rounded-[1.2cqw] border border-indigo-400/30 bg-indigo-500/10 px-[1.8cqw] py-[2cqw] text-center"
                  style={{ fontSize: "2.1cqw", width: "17cqw", ...delay(i) }}
                >
                  <span className="w-full">{b}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "bullets":
    default:
      return (
        <div className="flex h-full flex-col justify-center gap-[3.5cqw] px-[8cqw]">
          <SlideHeader slide={slide} />
          <ul className="flex flex-col gap-[2cqw]">
            {slide.bullets.map((b, i) => (
              <li key={`${i}-${b}`} className="animate-fade-up flex items-start gap-[1.6cqw]" style={{ fontSize: "2.9cqw", ...delay(i) }}>
                <span className="mt-[1.1cqw] shrink-0 rounded-full bg-indigo-400" style={{ width: "1cqw", height: "1cqw" }} />
                <span className="leading-snug">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      );
  }
}

function SlideHeader({ slide }: { slide: Slide }) {
  return (
    <div className="flex items-center gap-[2cqw]">
      <div className="shrink-0 rounded-[1.2cqw] bg-indigo-500/15 p-[1.2cqw] text-indigo-300">
        <SlideIconView name={slide.icon} style={{ width: "4cqw", height: "4cqw" }} />
      </div>
      <h2 key={slide.title} className="animate-fade-up font-bold leading-tight" style={{ fontSize: "4.6cqw" }}>
        {slide.title}
      </h2>
    </div>
  );
}
