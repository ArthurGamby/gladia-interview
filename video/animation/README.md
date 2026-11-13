# Code-switching animation

The 18-second loop at the top of the demo: one audio file plays (English, French, English),
each part travels down to two configs, and they only differ once the French arrives.
Built with [Remotion](https://www.remotion.dev) (React), colors taken from gladia.io.

```bash
npm ci        # once
./make.sh     # renders out/code-switching-flow.mp4 and ../../assets/code-switching.gif
npx remotion studio   # live preview while editing
```

Texts, labels and counts sit at the top of `src/CodeSwitchingFlow.tsx` (`ROUTES`). The audio
parts and when each one reaches each card are in `PARTS`, the other steps in `T`. Swap them to
explain another feature with the same cards and wires.
