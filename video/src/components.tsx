import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "./theme";

/** 0 -> 1 spring starting at `delay` frames. */
export function useSpring(delay = 0, damping = 18, stiffness = 120) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness, mass: 0.8 } });
}

const NOISE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;

export function Paper({ children }: { children?: ReactNode }) {
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.line} 1.6px, transparent 1.6px)`,
          backgroundSize: "54px 54px",
          opacity: 0.6,
        }}
      />
      <AbsoluteFill style={{ backgroundImage: NOISE, opacity: 0.35, mixBlendMode: "multiply" }} />
      {children}
    </AbsoluteFill>
  );
}

/** Words rise in one after another with a spring. */
export function Kinetic({
  text,
  delay = 0,
  size = 120,
  style,
  serif,
  color = C.ink,
  stagger = 4,
}: {
  text: string;
  delay?: number;
  size?: number;
  style?: CSSProperties;
  serif?: boolean;
  color?: string;
  stagger?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: `0 ${size * 0.26}px`,
        fontFamily: serif ? F.serif : F.head,
        fontStyle: serif ? "italic" : "normal",
        fontWeight: serif ? 400 : 700,
        fontSize: size,
        lineHeight: 1.02,
        letterSpacing: serif ? 0 : -size * 0.035,
        color,
        ...style,
      }}
    >
      {text.split(" ").map((w, i) => {
        const s = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 16, stiffness: 140, mass: 0.7 } });
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.12 }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - s) * 110}%) rotate(${(1 - s) * 6}deg)`, opacity: Math.min(1, s * 1.4) }}>
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function Label({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: 4, textTransform: "uppercase", color: C.muted, ...style }}>{children}</div>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: C.card,
        border: `2px solid ${C.ink}`,
        borderRadius: 28,
        boxShadow: `10px 12px 0 ${C.ink}`,
        padding: 36,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Laptop mockup with a real screenshot. `zoom` scales the screen content around `origin`. */
export function Laptop({ src, width = 960, zoom = 1, origin = "50% 50%", style }: { src: string; width?: number; zoom?: number; origin?: string; style?: CSSProperties }) {
  const h = (width * 900) / 1440;
  return (
    <div style={{ width, ...style }}>
      <div style={{ background: C.ink, borderRadius: 30, padding: 18, boxShadow: "0 40px 80px -30px rgba(0,0,0,0.45)" }}>
        <div style={{ width: width - 36, height: h - 22, overflow: "hidden", borderRadius: 12, background: "#000" }}>
          <Img src={staticFile(src)} style={{ width: "100%", transform: `scale(${zoom})`, transformOrigin: origin }} />
        </div>
      </div>
      <div style={{ height: 26, margin: "0 -40px", background: "#2a2826", borderRadius: "0 0 26px 26px" }} />
    </div>
  );
}

export function Phone({ src, width = 430, offsetY = 0, style }: { src: string; width?: number; offsetY?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        width,
        height: width * 2.08,
        background: C.ink,
        borderRadius: 70,
        padding: 16,
        boxShadow: "0 50px 90px -30px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: 56, overflow: "hidden", position: "relative" }}>
        <Img src={staticFile(src)} style={{ width: "100%", position: "absolute", left: 0, top: -offsetY }} />
        <div style={{ position: "absolute", top: 16, left: "50%", width: 120, height: 34, marginLeft: -60, borderRadius: 20, background: C.ink }} />
      </div>
    </div>
  );
}

/** Small floating motion for cards. */
export function useFloat(phase = 0, amp = 10) {
  const frame = useCurrentFrame();
  return Math.sin((frame + phase) / 22) * amp;
}

export const fadeIn = (frame: number, start: number, len = 10) =>
  interpolate(frame, [start, start + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
