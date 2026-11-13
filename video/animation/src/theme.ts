// Colors sampled pixel by pixel from the animations on gladia.io's landing page (dark theme).
export const C = {
  page: "#050506",
  dot: "#161618",
  card: "#111113",
  cardBorder: "#232325",
  divider: "#1E1E20",
  pill: "#1A1A1C",
  pillBorder: "#2A2A2C",
  white: "#FFFFFF",
  text: "#A3A3A3",
  mono: "#727272",
  monoDim: "#4A4A4C",
  line: "#5C5C5D",
  lineViolet: "#79758F",
  track: "#18181B",
  enTag: "#18181B",
  enTagBorder: "#242427",
  violet: "#907CF4",
  violetText: "#927DF4",
  violetGlow: "#8572E1",
  violetTag: "#1F1E29",
  orange: "#ED6E32",
  orangeGlow: "#D5642E",
  orangeTag: "#271A16",
  // before French arrives, both columns look the same
  neutralGlow: "#4A4A4E",
  neutralDot: "#8A8A8E",
  // the audio travelling down the wires
  waveEn: "#EDEDED",
  waveFr: "#B9AAFF",
  // chips on the white input node (light Gladia palette)
  chipGrey: "#F1F1F1",
  chipGreyText: "#727272",
  chipViolet: "#ECE7FC",
  chipVioletText: "#5740CE",
  chipDark: "#1C1C1E",
};

export const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// blend two hex colors, k = 0 gives a, k = 1 gives b
export const mix = (a: string, b: string, k: number) => {
  const na = parseInt(a.slice(1), 16);
  const nb = parseInt(b.slice(1), 16);
  return (
    "#" +
    [16, 8, 0]
      .map((s) => {
        const ca = (na >> s) & 255;
        const cb = (nb >> s) & 255;
        return Math.round(ca + (cb - ca) * k)
          .toString(16)
          .padStart(2, "0");
      })
      .join("")
  );
};
