import { Composition } from "remotion";
import { Reel } from "./Reel";
import { FPS, TOTAL } from "./timeline";

export const Root = () => (
  <Composition id="Reel" component={Reel} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
);
