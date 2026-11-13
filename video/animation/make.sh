#!/usr/bin/env bash
# Renders the animation, then encodes the MP4 (X, LinkedIn) and the GIF (README).
# Usage, from this folder: ./make.sh   (first time: npm ci)
set -euo pipefail
cd "$(dirname "$0")"

rm -rf out/frames
npx remotion render src/index.ts CodeSwitchingFlow out/frames --sequence --image-format=png --scale=1.2

# 1920x1080 MP4, tagged bt709 so colors stay right on social platforms
ffmpeg -v error -y -framerate 30 -i out/frames/element-%03d.png \
  -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv" \
  -c:v libx264 -crf 16 -preset slow -tune animation \
  -movflags +faststart out/code-switching-flow.mp4

# 1600 px GIF at 25 fps, one palette for the whole loop, only changed areas stored per frame
ffmpeg -v error -y -framerate 30 -i out/frames/element-%03d.png \
  -vf "fps=25,scale=1600:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" \
  -loop 0 ../../assets/code-switching.gif

ls -lh out/code-switching-flow.mp4 ../../assets/code-switching.gif
