import "./fonts";
import { Composition } from "remotion";
import { CodeSwitchingFlow, DURATION } from "./CodeSwitchingFlow";

export const Root = () => (
  <Composition
    id="CodeSwitchingFlow"
    component={CodeSwitchingFlow}
    durationInFrames={DURATION * 30}
    fps={30}
    width={1600}
    height={900}
  />
);
