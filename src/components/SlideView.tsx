import { Fragment, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import type { Slide } from "@/lib/slide";
import { SlideIconView } from "./SlideIconView";

const delay = (i: number): CSSProperties => ({ animationDelay: `${120 + i * 110}ms` });
const ACCENT_GRADIENT = "linear-gradient(120deg, var(--s-accent), var(--s-accent2))";
const gradientText: CSSProperties = { backgroundImage: ACCENT_GRADIENT };
const titleGradient: CSSProperties = {
  backgroundImage: "linear-gradient(120deg, var(--s-fg) 20%, var(--s-accent) 70%, var(--s-accent2))",
};
const card = "rounded-[1.4cqw] border border-[var(--s-border)] bg-[var(--s-surface)]";

/** Splits "Label: text" bullets so the label can be emphasised. */
function splitLabel(text: string): { label: string | null; body: string } {
  const m = text.match(/^([^:：]{1,28})[:：]\s*(.+)$/);
  return m ? { label: m[1].trim(), body: m[2].trim() } : { label: null, body: text };
}

function Emoji({ value, size, className = "", style }: { value: string; size: string; className?: string; style?: CSSProperties }) {
  return (
    <span key={value} className={`emoji animate-pop inline-block leading-none ${className}`} style={{ fontSize: size, ...style }} aria-hidden>
      {value}
    </span>
  );
}

/** Renders one slide. Colours and fonts come from theme CSS variables; sizes use container query units. */
export function SlideView({ slide }: { slide: Slide }) {
  return (
    <div className="relative h-full overflow-hidden">
      <SlideIconView
        name={slide.icon}
        className="pointer-events-none absolute text-[var(--s-accent)] opacity-[0.06]"
        style={{ width: "30cqw", height: "30cqw", right: "-4cqw", bottom: "-5cqw" }}
      />
      <Layout slide={slide} />
    </div>
  );
}

function Layout({ slide }: { slide: Slide }) {
  const [first, ...rest] = slide.bullets;

  switch (slide.layout) {
    case "title":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-[2cqw] px-[8cqw] text-center">
          <Emoji
            value={slide.emoji}
            size="9cqw"
            style={{ filter: "drop-shadow(0 0.8cqw 2.4cqw color-mix(in srgb, var(--s-accent) 50%, transparent))" }}
          />
          <h2
            key={slide.title}
            className="animate-fade-up bg-clip-text pb-[0.4cqw] font-bold leading-[1.15] tracking-tight text-transparent"
            style={{ fontSize: "6.4cqw", ...titleGradient, ...delay(0) }}
          >
            {slide.title}
          </h2>
          {first && (
            <p key={first} className="animate-fade-up text-[var(--s-muted)]" style={{ fontSize: "2.8cqw", ...delay(1) }}>
              {first}
            </p>
          )}
          <div className="animate-grow h-[0.5cqw] w-[12cqw] rounded-full" style={{ background: ACCENT_GRADIENT, ...delay(2) }} />
        </div>
      );

    case "quote":
      return (
        <div className="relative flex h-full flex-col justify-center gap-[2cqw] px-[10cqw]">
          <span className="bg-clip-text font-serif leading-none text-transparent" style={{ fontSize: "16cqw", height: "8cqw", ...gradientText }} aria-hidden>
            “
          </span>
          <blockquote key={slide.title} className="animate-fade-up font-semibold italic leading-snug" style={{ fontSize: "4.4cqw" }}>
            {slide.title}
          </blockquote>
          {first && (
            <p key={first} className="animate-fade-up flex items-center gap-[1.2cqw] text-[var(--s-muted)]" style={{ fontSize: "2.4cqw", ...delay(1) }}>
              <span className="h-[0.3cqw] w-[4cqw] rounded-full" style={{ background: ACCENT_GRADIENT }} />
              {first}
            </p>
          )}
          <div className="animate-float absolute right-[8cqw] top-[7cqw]">
            <Emoji value={slide.emoji} size="7cqw" />
          </div>
        </div>
      );

    case "metric":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-[1.4cqw] px-[8cqw] text-center">
          <Emoji value={slide.emoji} size="5.5cqw" />
          <p
            key={slide.title}
            className="animate-fade-up bg-clip-text font-extrabold leading-none tracking-tight text-transparent"
            style={{ fontSize: "13cqw", ...gradientText }}
          >
            {slide.title}
          </p>
          {first && (
            <p key={first} className="animate-fade-up font-semibold" style={{ fontSize: "3.2cqw", ...delay(0) }}>
              {first}
            </p>
          )}
          {rest.length > 0 && (
            <div className="mt-[1cqw] flex flex-wrap justify-center gap-[1.2cqw]">
              {rest.map((b, i) => (
                <span
                  key={`${i}-${b}`}
                  className={`animate-fade-up rounded-full px-[1.8cqw] py-[0.8cqw] text-[var(--s-muted)] ${card}`}
                  style={{ fontSize: "2cqw", ...delay(i + 1) }}
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      );

    case "diagram":
      if (slide.diagram === "cycle" && slide.bullets.length >= 3) return <CycleDiagram slide={slide} />;
      return (
        <div className="flex h-full flex-col justify-center gap-[4cqw] px-[6cqw]">
          <SlideHeader slide={slide} />
          {slide.diagram === "steps" ? <StepsDiagram bullets={slide.bullets} /> : <FlowDiagram bullets={slide.bullets} />}
        </div>
      );

    case "compare":
      return <CompareLayout slide={slide} />;

    case "bullets":
    default:
      return (
        <div className="flex h-full flex-col justify-center gap-[3cqw] px-[7cqw]">
          <SlideHeader slide={slide} />
          <ul className="flex flex-col gap-[1.3cqw]">
            {slide.bullets.map((b, i) => {
              const { label, body } = splitLabel(b);
              return (
                <li
                  key={`${i}-${b}`}
                  className={`animate-fade-up flex items-center gap-[1.6cqw] px-[2cqw] py-[1.2cqw] ${card}`}
                  style={{ fontSize: "2.6cqw", ...delay(i) }}
                >
                  <span
                    className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
                    style={{ width: "3.4cqw", height: "3.4cqw", fontSize: "1.6cqw", background: ACCENT_GRADIENT }}
                  >
                    {i + 1}
                  </span>
                  <span className="leading-snug">
                    {label && <strong className="font-semibold text-[var(--s-accent)]">{label}: </strong>}
                    {body}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      );
  }
}

function SlideHeader({ slide }: { slide: Slide }) {
  return (
    <div className="flex items-center gap-[2cqw]">
      <span
        className={`flex shrink-0 items-center justify-center ${card}`}
        style={{ width: "7.5cqw", height: "7.5cqw", borderRadius: "1.8cqw" }}
      >
        <Emoji value={slide.emoji} size="4cqw" />
      </span>
      <div className="min-w-0">
        <h2 key={slide.title} className="animate-fade-up font-bold leading-tight tracking-tight" style={{ fontSize: "4.4cqw" }}>
          {slide.title}
        </h2>
        <div className="animate-grow mt-[0.9cqw] h-[0.4cqw] w-[8cqw] rounded-full" style={{ background: ACCENT_GRADIENT }} />
      </div>
    </div>
  );
}

function FlowDiagram({ bullets }: { bullets: string[] }) {
  return (
    <div className="flex items-stretch justify-center gap-[1.2cqw]">
      {bullets.map((b, i) => (
        <Fragment key={`${i}-${b}`}>
          {i > 0 && (
            <ArrowRight
              className="animate-fade-up shrink-0 self-center text-[var(--s-accent)]"
              style={{ width: "3cqw", height: "3cqw", ...delay(i) }}
              aria-hidden
            />
          )}
          <div
            className={`animate-fade-up flex flex-1 flex-col gap-[1cqw] p-[1.8cqw] ${card}`}
            style={{ fontSize: "2.1cqw", maxWidth: "21cqw", ...delay(i) }}
          >
            <span className="bg-clip-text font-bold text-transparent" style={{ fontSize: "1.8cqw", ...gradientText }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="leading-snug">{b}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function StepsDiagram({ bullets }: { bullets: string[] }) {
  const n = Math.max(bullets.length, 1);
  return (
    <div className="relative">
      <div
        className="animate-grow absolute h-[0.4cqw] rounded-full"
        style={{ top: "2cqw", left: `${50 / n}%`, right: `${50 / n}%`, background: ACCENT_GRADIENT }}
      />
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {bullets.map((b, i) => (
          <div key={`${i}-${b}`} className="animate-fade-up flex flex-col items-center gap-[1.4cqw] px-[1cqw] text-center" style={delay(i)}>
            <span
              className="flex items-center justify-center rounded-full font-bold"
              style={{
                width: "4.4cqw",
                height: "4.4cqw",
                fontSize: "1.8cqw",
                background: "var(--s-bg1)",
                border: "0.4cqw solid var(--s-accent)",
                color: "var(--s-accent)",
              }}
            >
              {i + 1}
            </span>
            <span className="leading-snug" style={{ fontSize: "2.2cqw" }}>
              {b}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CycleDiagram({ slide }: { slide: Slide }) {
  const n = slide.bullets.length;
  return (
    <div className="flex h-full items-center gap-[3cqw] px-[6cqw]">
      <div className="w-[40%]">
        <SlideHeader slide={slide} />
      </div>
      <div className="relative shrink-0" style={{ width: "44cqw", height: "44cqw" }}>
        <div className="animate-spin-slow absolute inset-[14%] rounded-full" style={{ border: "0.35cqw dashed var(--s-accent)", opacity: 0.6 }} />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Emoji value={slide.emoji} size="6cqw" />
        </span>
        {slide.bullets.map((b, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          return (
            <div
              key={`${i}-${b}`}
              className="absolute"
              style={{ left: `${50 + 36 * Math.cos(angle)}%`, top: `${50 + 36 * Math.sin(angle)}%`, transform: "translate(-50%, -50%)" }}
            >
              <div
                className="animate-pop rounded-[1.2cqw] border border-[var(--s-border)] px-[1.4cqw] py-[1cqw] text-center leading-snug shadow-lg"
                style={{ fontSize: "1.8cqw", width: "16cqw", background: "var(--s-bg1)", ...delay(i) }}
              >
                {b}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompareLayout({ slide }: { slide: Slide }) {
  const half = Math.ceil(slide.bullets.length / 2);
  const columns = [slide.bullets.slice(0, half), slide.bullets.slice(half)];
  const colors = ["var(--s-accent)", "var(--s-accent2)"];
  return (
    <div className="flex h-full flex-col justify-center gap-[3cqw] px-[7cqw]">
      <SlideHeader slide={slide} />
      <div className="relative grid grid-cols-2 gap-[3cqw]">
        {columns.map((col, c) => (
          <div
            key={c}
            className="animate-fade-up flex flex-col gap-[1.6cqw] rounded-[1.6cqw] p-[2.4cqw]"
            style={{
              border: `0.15cqw solid ${colors[c]}`,
              background: `color-mix(in srgb, ${colors[c]} 10%, transparent)`,
              ...delay(c),
            }}
          >
            {col.map((b, i) => {
              const { label, body } = splitLabel(b);
              return (
                <div key={`${i}-${b}`}>
                  {label && (
                    <p className="font-bold" style={{ fontSize: "2.6cqw", color: colors[c] }}>
                      {label}
                    </p>
                  )}
                  <p className="leading-snug" style={{ fontSize: label ? "2.2cqw" : "2.5cqw" }}>
                    {body}
                  </p>
                </div>
              );
            })}
          </div>
        ))}
        {columns[1].length > 0 && (
          <span
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-black text-white shadow-lg"
            style={{ width: "6cqw", height: "6cqw", fontSize: "2cqw", background: ACCENT_GRADIENT }}
          >
            VS
          </span>
        )}
      </div>
    </div>
  );
}
