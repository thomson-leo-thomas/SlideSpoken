import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Card, Kinetic, Label, Laptop, Phone, fadeIn, useFloat, useSpring } from "./components";
import { C, F } from "./theme";

const pad = { padding: "170px 80px 0" };

function Mic({ size = 150 }: { size?: number }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, height: size }}>
      {Array.from({ length: 9 }, (_, i) => {
        const h = 0.25 + 0.75 * Math.abs(Math.sin(frame / 5 + i * 0.9)) * (1 - Math.abs(i - 4) / 6);
        return <div key={i} style={{ width: 18, height: size * h, borderRadius: 9, background: i % 2 ? C.ink : C.coral }} />;
      })}
    </div>
  );
}

export function Hook() {
  const s = useSpring(30);
  return (
    <AbsoluteFill style={{ ...pad, paddingTop: 360 }}>
      <Label>Devin Hacks Kochi</Label>
      <Kinetic text="What if your slides built" size={150} delay={4} style={{ marginTop: 40 }} />
      <Kinetic text="themselves," serif size={190} color={C.coral} delay={16} style={{ marginTop: -10 }} />
      <Kinetic text="while you talk?" size={150} delay={24} />
      <div style={{ marginTop: 90, transform: `scale(${s})`, transformOrigin: "left center" }}>
        <Mic />
      </div>
    </AbsoluteFill>
  );
}

function StackCard({ i }: { i: number }) {
  const s = useSpring(10 + i * 6);
  return (
    <div
      style={{
        position: "absolute",
        left: 60 + i * 40,
        top: 40 + i * 34,
        width: 640,
        height: 360,
        background: C.card,
        border: `2px solid ${C.ink}`,
        borderRadius: 22,
        transform: `translateY(${(1 - s) * 400}px) rotate(${(i - 1.5) * 3}deg)`,
        opacity: s,
        padding: 40,
      }}
    >
      <div style={{ width: "60%", height: 26, background: C.paperDeep, borderRadius: 13 }} />
      <div style={{ width: "80%", height: 18, background: C.paperDeep, borderRadius: 9, marginTop: 40 }} />
      <div style={{ width: "70%", height: 18, background: C.paperDeep, borderRadius: 9, marginTop: 20 }} />
    </div>
  );
}

export function Problem() {
  const frame = useCurrentFrame();
  const fake = useSpring(70);
  const strike = interpolate(frame, [105, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={pad}>
      <Label>The problem</Label>
      <div style={{ display: "flex", alignItems: "baseline", gap: 30, marginTop: 30 }}>
        <Kinetic text="Slides take" size={130} delay={2} />
        <Kinetic text="hours." serif size={160} color={C.coral} delay={10} />
      </div>
      <div style={{ position: "relative", height: 420, marginTop: 40 }}>
        {[0, 1, 2, 3].map((i) => (
          <StackCard key={i} i={i} />
        ))}
      </div>
      <div style={{ marginTop: 60, opacity: fake, transform: `translateY(${(1 - fake) * 60}px)` }}>
        <Kinetic text="And AI tools add facts you" size={78} delay={70} />
        <Kinetic text="never said." serif size={100} color={C.coral} delay={82} />
        <Card style={{ marginTop: 40, width: 700, position: "relative", padding: "30px 36px" }}>
          <Label style={{ fontSize: 22 }}>AI-generated slide · example</Label>
          <div style={{ fontFamily: F.head, fontSize: 52, fontWeight: 700, marginTop: 14, color: C.ink }}>“Adoption up 300%”</div>
          <div style={{ position: "absolute", left: 30, right: 30, top: "62%", height: 8, background: C.coral, transform: `scaleX(${strike})`, transformOrigin: "left" }} />
          <div style={{ position: "absolute", right: -30, top: -34, background: C.coral, color: "#fff", fontFamily: F.mono, fontSize: 26, padding: "8px 16px", borderRadius: 10, transform: `rotate(6deg) scale(${strike})` }}>
            never said
          </div>
        </Card>
      </div>
    </AbsoluteFill>
  );
}

export function Intro() {
  const frame = useCurrentFrame();
  const logo = useSpring(4, 12, 110);
  const lap = useSpring(40, 20);
  const zoom = interpolate(frame, [60, 190], [1, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ ...pad, alignItems: "center", textAlign: "center" }}>
      <Label>Meet</Label>
      <div style={{ fontFamily: F.head, fontWeight: 700, fontSize: 170, letterSpacing: -7, marginTop: 20, transform: `scale(${0.6 + 0.4 * logo})`, opacity: logo, color: C.ink }}>
        Slidespoken
      </div>
      <div style={{ height: 10, width: 260 * logo, background: C.coral, borderRadius: 5, marginTop: 6 }} />
      <Kinetic text="Speak. Your slides" size={88} delay={20} style={{ justifyContent: "center", marginTop: 50 }} />
      <Kinetic text="build themselves." serif size={110} color={C.coral} delay={28} style={{ justifyContent: "center" }} />
      <div style={{ marginTop: 90, transform: `translateY(${(1 - lap) * 700}px) scale(${zoom})`, opacity: lap }}>
        <Laptop src="shots/slide-canvas.png" width={960} />
      </div>
    </AbsoluteFill>
  );
}

const MINI = [
  { kind: "Diagram", title: "How Solar Power Works", items: ["Panel captures sunlight", "Inverter converts power", "Power goes to the grid"] },
  { kind: "Compare", title: "Solar vs Diesel Generators", items: ["Solar: quieter, cheaper to run", "Diesel: works at night"] },
];

function MiniSlide({ m, delay, x, y, rot }: { m: (typeof MINI)[number]; delay: number; x: number; y: number; rot: number }) {
  const s = useSpring(delay);
  const f = useFloat(delay * 3, 8);
  return (
    <div style={{ position: "absolute", left: x, top: y + f, transform: `scale(${s}) rotate(${rot}deg)`, opacity: s }}>
      <div style={{ width: 600, height: 338, background: "linear-gradient(135deg,#06182b,#0a2540 55%,#062a3a)", borderRadius: 24, padding: 34, color: "#e6f6ff", boxShadow: `10px 12px 0 ${C.ink}`, border: `2px solid ${C.ink}` }}>
        <div style={{ fontFamily: F.mono, fontSize: 20, color: "#38bdf8", letterSpacing: 3 }}>{m.kind.toUpperCase()}</div>
        <div style={{ fontFamily: F.head, fontWeight: 700, fontSize: 40, marginTop: 10 }}>{m.title}</div>
        <div style={{ display: "flex", gap: 14, marginTop: 30 }}>
          {m.items.map((it, i) => (
            <div key={i} style={{ flex: 1, border: "1.5px solid rgba(56,189,248,0.4)", background: "rgba(56,189,248,0.1)", borderRadius: 14, padding: 14, fontFamily: F.head, fontSize: 22, lineHeight: 1.2 }}>
              {it}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const LANGS = ["English", "മലയാളം", "हिन्दी"];
const CMDS = ["“next slide”", "“go back”", "“make this a quote”", "“add a title slide”"];

function LangLine({ t, i }: { t: string; i: number }) {
  const s = useSpring(14 + i * 8);
  return (
    <div style={{ fontFamily: F.head, fontWeight: 600, fontSize: 130, lineHeight: 1.35, transform: `translateX(${(1 - s) * -300}px)`, opacity: s, paddingLeft: i * 90, color: i === 1 ? C.coral : C.ink }}>
      {t}
    </div>
  );
}

function FeatLanguages() {
  const frame = useCurrentFrame();
  const f = useFloat(0, 12);
  return (
    <AbsoluteFill style={pad}>
      <Label>Features · 01</Label>
      <Kinetic text="Speak in" size={120} delay={2} style={{ marginTop: 30 }} />
      <Kinetic text="your language." serif size={140} color={C.coral} delay={8} />
      <div style={{ marginTop: 60 }}>
        {LANGS.map((t, i) => (
          <LangLine key={t} t={t} i={i} />
        ))}
      </div>
      <div style={{ position: "absolute", right: 70, bottom: 330, opacity: fadeIn(frame, 40), transform: `translateY(${f}px) rotate(-3deg)` }}>
        <Img src={staticFile("shots/language-selector.png")} style={{ width: 520, borderRadius: 24, boxShadow: `10px 12px 0 ${C.ink}`, border: `2px solid ${C.ink}` }} />
      </div>
    </AbsoluteFill>
  );
}

function FeatLive() {
  const frame = useCurrentFrame();
  const f = useFloat(10, 10);
  const zoom = interpolate(frame, [10, 110], [1, 1.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={pad}>
      <Label>Features · 02</Label>
      <Kinetic text="Your words," size={120} delay={2} style={{ marginTop: 30 }} />
      <Kinetic text="live on the slide." serif size={130} color={C.coral} delay={8} />
      <div style={{ marginTop: 90, marginLeft: -20 }}>
        <Laptop src="shots/live-transcript.png" width={960} zoom={zoom} origin="28% 62%" />
      </div>
      <Card style={{ position: "absolute", left: 90, bottom: 360, padding: "20px 28px", transform: `translateY(${f}px)`, opacity: fadeIn(frame, 30) }}>
        <span style={{ fontFamily: F.mono, fontSize: 30 }}>
          word-by-word captions <span style={{ color: C.coral }}>●</span> real UI
        </span>
      </Card>
    </AbsoluteFill>
  );
}

function Chip({ c, i }: { c: string; i: number }) {
  const s = useSpring(40 + i * 6);
  return (
    <div style={{ fontFamily: F.mono, fontSize: 32, padding: "14px 24px", borderRadius: 40, border: `2px solid ${C.ink}`, background: i === 0 ? C.ink : C.card, color: i === 0 ? C.paper : C.ink, transform: `scale(${s})` }}>
      {c}
    </div>
  );
}

function FeatLayouts() {
  return (
    <AbsoluteFill style={pad}>
      <Label>Features · 03</Label>
      <Kinetic text="Designed slides," size={120} delay={2} style={{ marginTop: 30 }} />
      <Kinetic text="not walls of text." serif size={130} color={C.coral} delay={8} />
      <div style={{ position: "relative", height: 820, marginTop: 30 }}>
        <MiniSlide m={MINI[0]} delay={12} x={0} y={40} rot={-3} />
        <MiniSlide m={MINI[1]} delay={22} x={300} y={420} rot={3} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, position: "absolute", left: 80, right: 80, bottom: 330 }}>
        {CMDS.map((c, i) => (
          <Chip key={c} c={c} i={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
}

export function Features() {
  const { durationInFrames } = useVideoConfig();
  const third = Math.floor(durationInFrames / 3);
  return (
    <>
      <Sequence durationInFrames={third}>
        <FeatLanguages />
      </Sequence>
      <Sequence from={third} durationInFrames={third}>
        <FeatLive />
      </Sequence>
      <Sequence from={third * 2}>
        <FeatLayouts />
      </Sequence>
    </>
  );
}

const PIPE = [
  { k: "Mic", v: "records nonstop" },
  { k: "5 s chunk", v: "silent chunks skipped" },
  { k: "gpt-4o-mini-transcribe", v: "speech → text" },
  { k: "gpt-4o-mini", v: "strict JSON slide" },
  { k: "Evidence check", v: "unproven bullets dropped" },
  { k: "Slide", v: "on screen ≥ 3 s" },
];

function PipeRow({ p, i, top, gap }: { p: (typeof PIPE)[number]; i: number; top: number; gap: number }) {
  const s = useSpring(14 + i * 16);
  return (
    <div style={{ position: "absolute", left: 110, top: top + i * gap, display: "flex", alignItems: "center", gap: 40, opacity: s, transform: `translateX(${(1 - s) * 200}px)` }}>
      <div style={{ width: 86, height: 86, borderRadius: 43, background: i === 4 ? C.coral : C.ink, color: "#fff", fontFamily: F.mono, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", border: `6px solid ${C.paper}` }}>
        0{i + 1}
      </div>
      <Card style={{ padding: "22px 30px", width: 700, boxShadow: `8px 9px 0 ${i === 4 ? C.coral : C.ink}` }}>
        <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 36, color: C.ink }}>{p.k}</div>
        <div style={{ fontFamily: F.head, fontSize: 30, color: C.muted, marginTop: 4 }}>{p.v}</div>
      </Card>
    </div>
  );
}

export function HowItWorks() {
  const frame = useCurrentFrame();
  const top = 470;
  const gap = 205;
  const dotY = interpolate(frame % 90, [0, 90], [0, gap * (PIPE.length - 1)]);
  const lineH = interpolate(frame, [10, 120], [0, gap * (PIPE.length - 1)], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={pad}>
      <Label>How it works</Label>
      <div style={{ display: "flex", alignItems: "baseline", gap: 26, marginTop: 30 }}>
        <Kinetic text="Every" size={120} delay={2} />
        <Kinetic text="5 seconds." serif size={140} color={C.coral} delay={8} />
      </div>
      <div style={{ position: "absolute", left: 150, top: top + 40, width: 6, height: lineH, background: C.ink, borderRadius: 3 }} />
      <div style={{ position: "absolute", left: 141, top: top + 31 + dotY, width: 24, height: 24, borderRadius: 12, background: C.coral, opacity: fadeIn(frame, 120) }} />
      {PIPE.map((p, i) => (
        <PipeRow key={p.k} p={p} i={i} top={top} gap={gap} />
      ))}
    </AbsoluteFill>
  );
}

export function Payoff() {
  const frame = useCurrentFrame();
  const transcript = "Rooftop solar panels in Kerala doubled in three years.";
  const typed = Math.floor(interpolate(frame, [20, 70], [0, transcript.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const hl = fadeIn(frame, 78, 12);
  const ok = useSpring(92);
  const bad = useSpring(118);
  const strike = interpolate(frame, [140, 158], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shown = transcript.slice(0, typed);
  const phrase = "doubled in three years";
  const at = transcript.indexOf(phrase);
  return (
    <AbsoluteFill style={pad}>
      <Label>Grounded slides</Label>
      <Kinetic text="Your words." size={130} delay={2} style={{ marginTop: 30 }} />
      <Kinetic text="Nothing added." serif size={150} color={C.coral} delay={10} />
      <Card style={{ marginTop: 60, background: C.ink, color: C.paper, boxShadow: `10px 12px 0 ${C.coral}` }}>
        <div style={{ fontFamily: F.mono, fontSize: 24, color: "#9b948a", letterSpacing: 3 }}>TRANSCRIPT</div>
        <div style={{ fontFamily: F.mono, fontSize: 40, lineHeight: 1.5, marginTop: 14 }}>
          {typed > at ? shown.slice(0, at) : shown}
          {typed > at && (
            <span style={{ background: `rgba(255,90,78,${0.35 * hl})`, borderBottom: `4px solid rgba(255,90,78,${hl})` }}>{shown.slice(at, at + phrase.length)}</span>
          )}
          {typed > at + phrase.length && shown.slice(at + phrase.length)}
          <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>▍</span>
        </div>
      </Card>
      <div style={{ fontFamily: F.mono, fontSize: 30, color: C.coral, margin: "34px 0 0 40px", opacity: hl }}>↓ evidence</div>
      <Card style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", transform: `scale(${ok})`, opacity: ok }}>
        <span style={{ fontFamily: F.head, fontSize: 46, fontWeight: 700 }}>Panels doubled in 3 years</span>
        <span style={{ fontFamily: F.mono, fontSize: 28, color: "#1a7f37" }}>✓ kept</span>
      </Card>
      <Card style={{ marginTop: 34, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", transform: `scale(${bad})`, opacity: bad * (1 - 0.45 * strike) }}>
        <span style={{ fontFamily: F.head, fontSize: 46, fontWeight: 700 }}>Importance of renewables</span>
        <span style={{ fontFamily: F.mono, fontSize: 28, color: C.coral }}>✗ no evidence</span>
        <div style={{ position: "absolute", left: 30, right: 260, top: "50%", height: 6, background: C.coral, transform: `scaleX(${strike})`, transformOrigin: "left" }} />
      </Card>
    </AbsoluteFill>
  );
}

export function End() {
  const frame = useCurrentFrame();
  const logo = useSpring(4, 12, 110);
  const phone = useSpring(20, 20);
  return (
    <AbsoluteFill style={{ ...pad, alignItems: "center", textAlign: "center" }}>
      <div style={{ fontFamily: F.head, fontWeight: 700, fontSize: 160, letterSpacing: -6, transform: `scale(${0.7 + 0.3 * logo})`, opacity: logo, color: C.ink, marginTop: 40 }}>
        Slidespoken
      </div>
      <Kinetic text="Say it. See it." serif size={130} color={C.coral} delay={12} style={{ justifyContent: "center" }} />
      <div style={{ marginTop: 50, transform: `translateY(${(1 - phone) * 500}px) rotate(${(1 - phone) * 8}deg)` }}>
        <Phone src="shots/landing-mobile.png" width={400} />
      </div>
      <div style={{ marginTop: 50, fontFamily: F.mono, fontSize: 32, color: C.ink, opacity: fadeIn(frame, 40) }}>
        github.com/thomson-leo-thomas/SlideSpoken
      </div>
      <Label style={{ marginTop: 18, fontSize: 24 }}>Built with Devin · Devin Hacks Kochi</Label>
    </AbsoluteFill>
  );
}
