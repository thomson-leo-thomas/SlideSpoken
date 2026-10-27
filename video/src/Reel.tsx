import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TransitionSeries, springTiming, type TransitionPresentation } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";
import { Paper } from "./components";
import { End, Features, Hook, HowItWorks, Intro, Payoff, Problem } from "./scenes";
import { C, F } from "./theme";
import { CAPTIONS, FPS, SCENES, STARTS, TOTAL, TRANSITION, VO_SECONDS, VO_STARTS } from "./timeline";

const SCENE_COMPONENTS = [Hook, Problem, Intro, Features, HowItWorks, Payoff, End];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PRESENTATIONS: TransitionPresentation<any>[] = [
  slide({ direction: "from-bottom" }),
  wipe({ direction: "from-right" }),
  slide({ direction: "from-right" }),
  fade(),
  wipe({ direction: "from-bottom" }),
  slide({ direction: "from-bottom" }),
];

function Captions() {
  const frame = useCurrentFrame();
  const i = VO_STARTS.findLastIndex((s) => frame >= s);
  if (i < 0) return null;
  const local = (frame - VO_STARTS[i]) / FPS;
  if (local > VO_SECONDS[i] + 0.4) return null;
  const words = CAPTIONS[i].split(" ");
  const current = Math.min(words.length - 1, Math.floor((local / VO_SECONDS[i]) * words.length));
  const startWord = Math.max(0, current - 5);
  const visible = words.slice(startWord, current + 1);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 150, display: "flex", justifyContent: "center" }}>
      <div style={{ background: C.ink, color: C.paper, borderRadius: 22, padding: "18px 30px", fontFamily: F.head, fontWeight: 700, fontSize: 46, lineHeight: 1.25, textAlign: "center", maxWidth: 900 }}>
        {visible.map((w, k) => (
          <span key={startWord + k} style={{ color: startWord + k === current ? C.coral : C.paper }}>
            {w}{" "}
          </span>
        ))}
      </div>
    </div>
  );
}

function Chrome() {
  const frame = useCurrentFrame();
  const scene = STARTS.findLastIndex((s) => frame >= s) + 1;
  const progress = interpolate(frame, [0, TOTAL], [0, 1]);
  return (
    <>
      <div style={{ position: "absolute", top: 70, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 26, letterSpacing: 4, color: C.muted }}>
        <span>SLIDESPOKEN</span>
        <span>
          0{scene} / 0{SCENES.length}
        </span>
      </div>
      <div style={{ position: "absolute", top: 118, left: 80, right: 80, height: 4, background: C.line, borderRadius: 2 }}>
        <div style={{ width: `${progress * 100}%`, height: "100%", background: C.coral, borderRadius: 2 }} />
      </div>
    </>
  );
}

export function Reel() {
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <TransitionSeries>
        {SCENE_COMPONENTS.map((Scene, i) => [
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={SCENES[i]}>
            <Paper>
              <Scene />
            </Paper>
          </TransitionSeries.Sequence>,
          i < PRESENTATIONS.length ? (
            <TransitionSeries.Transition
              key={`t${i}`}
              presentation={PRESENTATIONS[i]}
              timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
            />
          ) : null,
        ])}
      </TransitionSeries>
      <Chrome />
      <Captions />

      <Audio src={staticFile("audio/bed.wav")} volume={(f) => interpolate(f, [0, 30, TOTAL - 45, TOTAL], [0, 0.22, 0.22, 0], { extrapolateRight: "clamp" })} />
      {VO_STARTS.map((s, i) => (
        <Sequence key={`vo${i}`} from={s}>
          <Audio src={staticFile(`audio/vo-${i + 1}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {STARTS.slice(1).map((s, i) => (
        <Sequence key={`wh${i}`} from={s - 6} durationInFrames={20}>
          <Audio src={staticFile("audio/whoosh.wav")} volume={0.35} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
