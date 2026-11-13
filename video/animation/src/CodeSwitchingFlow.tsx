import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MONO, SANS } from "./fonts";
import { C, alpha, mix } from "./theme";

// One audio file plays at the top. Each part of it (English, French, English) travels down
// the wires as a wave, and both configs process it. They only differ once the French arrives.
// Texts and counts come from the real API responses in ../../responses/chat-v3.*.

type Lang = "en" | "fr";

type Route = {
  value: "false" | "true";
  accent: string;
  glow: string;
  tag: string;
  tagText: string;
  frenchLabel: string; // how this config labels the French part
  status: string;
  icon: string;
  french: string; // the French line as transcribed
  translation: string | null; // its English translation, if any
  ratio: number; // share of the 8 French utterances that got translated
};

const ROUTES: Route[] = [
  {
    value: "false",
    accent: C.orange,
    glow: C.orangeGlow,
    tag: C.orangeTag,
    tagText: C.orange,
    frenchLabel: "EN",
    status: "Not translated",
    icon: "✕",
    french: "merci Paul pour les croissants…",
    translation: null,
    ratio: 0,
  },
  {
    value: "true",
    accent: C.violet,
    glow: C.violetGlow,
    tag: C.violetTag,
    tagText: C.violetText,
    frenchLabel: "FR",
    status: "Translated",
    icon: "✓",
    french: "Merci Paul pour les croissants…",
    translation: "Thank you Paul for the croissants…",
    ratio: 1,
  },
];

// The three parts of the clip, in seconds: when they are spoken on the input node, then when
// their wave leaves the node, reaches the detection card (seg) and the transcript card (line).
type Part = {
  lang: Lang;
  label: string;
  from: number;
  to: number;
  wire: number;
  conn1: number;
  seg: number;
  conn2: number;
  line: number;
  text: string;
};
const PARTS: Part[] = [
  { lang: "en", label: "EN", from: 1.2, to: 5.2, wire: 1.8, conn1: 2.95, seg: 3.65, conn2: 4.25, line: 4.95, text: "Paul is asking me something…" },
  { lang: "fr", label: "FR", from: 5.5, to: 9.5, wire: 6.1, conn1: 7.25, seg: 7.6, conn2: 8.2, line: 8.55, text: "" },
  { lang: "en", label: "EN", from: 9.9, to: 13.1, wire: 10.5, conn1: 11.65, seg: 12.0, conn2: 12.6, line: 12.95, text: "I am switching back to English…" },
];
const WIRE_DUR = 1.15; // node to config pills
const CONN_DUR = 0.35; // short wires between cards
const T = {
  node: 0.2,
  pills: 2.75,
  cardA: 3.2,
  langs: 3.95,
  cardB: 4.45,
  accentA: 7.6, // French reaches the detection cards: the columns take their colors
  frAdd: 7.85,
  diverge: 9.3, // the French line is translated, or not
  status: 13.85,
  bar: 14.05,
  out: 17.2,
};
export const DURATION = 18;

// share of the clip spoken in English, French, English (0-9.4 s, 9.4-15.4 s, 15.4-23.3 s)
const SEGMENTS = [40, 26, 34];
const WAVE: Record<Lang, string> = { en: C.waveEn, fr: C.waveFr };

const CENTER = 800;
const COLUMNS = [420, 1180];
const CARD_W = 640;
const NODE_Y = 40;
const NODE_H = 78;
const SPLIT_Y = 152;
const PILL_Y = 188;

const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const SMOOTH = Easing.inOut(Easing.cubic);
const LINEAR = (n: number) => n;

const useTime = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // 0 -> 1 progress of an animation starting at `start` seconds and lasting `dur` seconds
  const p = (start: number, dur: number, easing: (n: number) => number = EASE) =>
    interpolate(t, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing,
    });
  return { t, p };
};

const typed = (text: string, k: number) => text.slice(0, Math.round(text.length * k));

// a short flash that peaks right after `at`, then fades
const useFlash = () => {
  const { p } = useTime();
  return (at: number, decay = 0.7) => p(at, 0.15) * (1 - p(at + 0.2, decay));
};

const Dot: React.FC<{ color: string; size?: number }> = ({ color, size = 12 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      background: color,
      boxShadow: `0 0 ${size}px ${alpha(color, 0.55)}`,
      flexShrink: 0,
    }}
  />
);

const Title: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <Dot color={color} />
    <span style={{ fontFamily: SANS, fontSize: 28, fontWeight: 500, color: C.white, letterSpacing: -0.2 }}>
      {children}
    </span>
  </div>
);

const Divider = () => <div style={{ height: 1, background: C.divider }} />;

const Caret: React.FC<{ on: boolean }> = ({ on }) =>
  on ? (
    <span
      style={{ display: "inline-block", width: 2, height: 24, marginLeft: 3, background: C.text, verticalAlign: -4 }}
    />
  ) : null;

// a card that rises in; its border lights up in the column color once `accent` reaches 1
const Card: React.FC<{ route: Route; start: number; accent: number; children: React.ReactNode }> = ({
  route,
  start,
  accent,
  children,
}) => {
  const { p } = useTime();
  const a = p(start, 0.55);
  const glow = mix(C.neutralGlow, route.glow, accent);
  return (
    <div
      style={{
        width: CARD_W,
        padding: 1.5,
        borderRadius: 20,
        opacity: a,
        transform: `translateY(${22 * (1 - a)}px)`,
        background: `linear-gradient(155deg, ${glow} 0%, ${alpha(glow, 0.25)} 22%, ${C.cardBorder} 42%)`,
        boxShadow: "0 28px 60px rgba(0, 0, 0, 0.6)",
      }}
    >
      <div style={{ background: C.card, borderRadius: 18.5, overflow: "hidden" }}>{children}</div>
    </div>
  );
};

// a wave: a glowing comet travelling down a short vertical wire
const COMET = 30;
const Comet: React.FC<{ u: number; height: number; color: string }> = ({ u, height, color }) =>
  u > 0 && u < 1 ? (
    <div
      style={{
        position: "absolute",
        left: -0.75,
        width: 3.5,
        top: u * (height + COMET) - COMET,
        height: COMET,
        borderRadius: 2,
        background: `linear-gradient(to bottom, ${alpha(color, 0)}, ${color})`,
        filter: `drop-shadow(0 0 5px ${color})`,
      }}
    />
  ) : null;

const Connector: React.FC<{ route: Route; height: number; stage: "conn1" | "conn2"; accent: number }> = ({
  route,
  height,
  stage,
  accent,
}) => {
  const { p } = useTime();
  const drawn = p(PARTS[0][stage], CONN_DUR, LINEAR);
  return (
    <div style={{ position: "relative", width: 2, height, clipPath: "inset(0 -12px 0 -12px)" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${C.line}, ${alpha(mix(C.neutralGlow, route.glow, accent), 0.9)})`,
          clipPath: `inset(0 0 ${(1 - drawn) * 100}% 0)`,
        }}
      />
      {PARTS.map((part, i) => (
        <Comet key={i} u={p(part[stage], CONN_DUR, LINEAR)} height={height} color={WAVE[part.lang]} />
      ))}
    </div>
  );
};

const ConfigPill: React.FC<{ route: Route }> = ({ route }) => {
  const { p } = useTime();
  const flash = useFlash();
  const a = p(T.pills, 0.45);
  // the pill lights up as each wave passes through it
  const hits = PARTS.map((part) => ({ k: flash(part.conn1 - 0.1, 0.5), color: WAVE[part.lang] }));
  const hit = hits.reduce((best, h) => (h.k > best.k ? h : best), hits[0]);
  return (
    <div
      style={{
        height: 46,
        padding: "0 20px",
        borderRadius: 23,
        background: C.pill,
        border: `1px solid ${mix(C.pillBorder, hit.color, hit.k * 0.8)}`,
        boxShadow: hit.k > 0 ? `0 0 ${22 * hit.k}px ${alpha(hit.color, 0.35 * hit.k)}` : "none",
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: MONO,
        fontSize: 21,
        opacity: a,
        transform: `translateY(${10 * (1 - a)}px)`,
      }}
    >
      <Dot color={route.accent} size={9} />
      <span style={{ color: C.text }}>"code_switching":</span>
      <span style={{ color: route.tagText }}>{route.value}</span>
    </div>
  );
};

const Languages: React.FC<{ route: Route }> = ({ route }) => {
  const { p } = useTime();
  const k1 = p(T.langs, 0.4, LINEAR);
  const k2 = p(T.frAdd, 0.3, LINEAR);
  const full = '"languages": ["en"]';
  const style: React.CSSProperties = { fontFamily: MONO, fontSize: 20, color: C.mono, marginTop: 10, height: 26, whiteSpace: "pre" };
  if (route.translation === null || k1 < 1 || k2 === 0) {
    return <div style={style}>{typed(full, k1)}</div>;
  }
  return (
    <div style={style}>
      {'"languages": ["en"'}
      <span style={{ color: route.tagText }}>{typed(', "fr"', k2)}</span>]
    </div>
  );
};

const Detection: React.FC<{ route: Route }> = ({ route }) => {
  const { p } = useTime();
  const flash = useFlash();
  const accent = p(T.accentA, 0.5);
  return (
    <Card route={route} start={T.cardA} accent={accent}>
      <div style={{ padding: "22px 28px 20px" }}>
        <Title color={mix(C.neutralDot, route.accent, accent)}>Language detection</Title>
        <Languages route={route} />
      </div>
      <Divider />
      <div style={{ padding: "18px 28px 22px", display: "flex", gap: 8 }}>
        {PARTS.map((part, i) => {
          const french = part.lang === "fr";
          const s = p(part.seg, 0.4);
          const f = flash(part.seg, french ? 0.9 : 0.5);
          const color = french ? route.accent : C.waveEn;
          return (
            <div key={i} style={{ flex: SEGMENTS[i], position: "relative", height: 46 }}>
              {/* empty slot, waiting for this part of the audio */}
              <div style={{ position: "absolute", inset: 0, borderRadius: 10, border: `1px dashed ${C.enTagBorder}` }} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 10,
                  background: french ? route.tag : C.enTag,
                  border: `1px solid ${french ? alpha(route.accent, 0.5) : C.enTagBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: MONO,
                  fontSize: 19,
                  letterSpacing: 1.5,
                  color: french ? route.tagText : C.text,
                  opacity: s,
                  transform: `scale(${0.94 + 0.06 * s + (french ? 0.05 * f : 0)})`,
                  boxShadow: f > 0 ? `0 0 ${(french ? 34 : 16) * f}px ${alpha(color, (french ? 0.65 : 0.25) * f)}` : "none",
                }}
              >
                {french ? route.frenchLabel : part.label}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const LineRow: React.FC<{ time: string; start: number; dot: string; children: React.ReactNode }> = ({
  time,
  start,
  dot,
  children,
}) => {
  const { p } = useTime();
  const a = p(start, 0.25);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, height: 38, opacity: a }}>
      <Dot color={dot} size={8} />
      <span style={{ fontFamily: MONO, fontSize: 20, color: C.mono }}>{time}</span>
      {children}
    </div>
  );
};

const TEXT: React.CSSProperties = { fontFamily: SANS, fontSize: 23, whiteSpace: "pre" };

const TypedLine: React.FC<{ time: string; part: Part }> = ({ time, part }) => {
  const { p } = useTime();
  const k = p(part.line + 0.1, 0.6, LINEAR);
  return (
    <LineRow time={time} start={part.line} dot={C.monoDim}>
      <span style={{ ...TEXT, color: C.text }}>
        {typed(part.text, k)}
        <Caret on={k > 0 && k < 1} />
      </span>
    </LineRow>
  );
};

// the French line: typed as heard, then left as is (false) or translated (true)
const FrenchLine: React.FC<{ route: Route }> = ({ route }) => {
  const { p } = useTime();
  const part = PARTS[1];
  const k = p(part.line + 0.1, 0.65, LINEAR);
  const d = p(T.diverge, 0.5);
  const box: React.CSSProperties = {
    ...TEXT,
    gridArea: "1 / 1",
    justifySelf: "start",
    borderRadius: 6,
    padding: "3px 9px",
  };
  const french = (
    <>
      {typed(route.french, k)}
      <Caret on={k > 0 && k < 1} />
    </>
  );
  return (
    <LineRow time="00:09" start={part.line} dot={mix(C.monoDim, route.accent, d)}>
      <span style={{ display: "inline-grid", marginLeft: -9 }}>
        {route.translation === null ? (
          <span style={{ ...box, color: mix(C.text, route.tagText, d), background: alpha(route.tag, d) }}>
            {french}
          </span>
        ) : (
          <>
            <span style={{ ...box, color: C.text, opacity: 1 - d, transform: `translateY(${-8 * d}px)` }}>
              {french}
            </span>
            <span
              style={{
                ...box,
                color: route.tagText,
                background: route.tag,
                opacity: d,
                transform: `translateY(${8 * (1 - d)}px)`,
              }}
            >
              {route.translation}
            </span>
          </>
        )}
      </span>
    </LineRow>
  );
};

const Transcript: React.FC<{ route: Route }> = ({ route }) => {
  const { p } = useTime();
  const accent = p(T.diverge, 0.5);
  const st = p(T.status, 0.45);
  const fill = route.ratio * p(T.bar, 0.8);
  const count = p(T.bar - 0.1, 0.3);
  return (
    <Card route={route} start={T.cardB} accent={accent}>
      <div
        style={{ padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Title color={mix(C.neutralDot, route.accent, accent)}>English transcript</Title>
        <div
          style={{
            height: 38,
            padding: "0 16px",
            borderRadius: 19,
            background: route.tag,
            border: `1px solid ${alpha(route.accent, 0.35)}`,
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontFamily: MONO,
            fontSize: 18,
            color: route.tagText,
            opacity: st,
            transform: `scale(${0.9 + 0.1 * st})`,
          }}
        >
          <span style={{ fontSize: 17 }}>{route.icon}</span>
          {route.status}
        </div>
      </div>
      <Divider />
      <div style={{ padding: "16px 28px", display: "flex", flexDirection: "column", gap: 6 }}>
        <TypedLine time="00:05" part={PARTS[0]} />
        <FrenchLine route={route} />
        <TypedLine time="00:15" part={PARTS[2]} />
      </div>
      <Divider />
      <div style={{ padding: "18px 28px 20px", display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ fontFamily: MONO, fontSize: 17, letterSpacing: 1.5, color: C.mono }}>FR → EN</span>
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: C.track, overflow: "hidden" }}>
          <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 4, background: route.accent }} />
        </div>
        <span
          style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 1, color: route.tagText, opacity: count, whiteSpace: "pre" }}
        >
          {`${Math.round(8 * fill)} / 8`}
        </span>
      </div>
    </Card>
  );
};

const Column: React.FC<{ route: Route; x: number }> = ({ route, x }) => {
  const { p } = useTime();
  return (
    <div
      style={{
        position: "absolute",
        top: PILL_Y,
        left: x - CARD_W / 2,
        width: CARD_W,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <ConfigPill route={route} />
      <Connector route={route} height={30} stage="conn1" accent={p(T.accentA, 0.5)} />
      <Detection route={route} />
      <Connector route={route} height={28} stage="conn2" accent={p(T.diverge, 0.5)} />
      <Transcript route={route} />
    </div>
  );
};

// one chip per part of the audio: dim until spoken, dark with sonar rings while spoken, then lit
const Chip: React.FC<{ part: Part }> = ({ part }) => {
  const { t, p } = useTime();
  const fr = part.lang === "fr";
  const lit = p(part.from, 0.3);
  const speaking = lit * (1 - p(part.to, 0.35));
  const restBg = fr ? mix(C.chipGrey, C.chipViolet, lit) : C.chipGrey;
  const restFg = fr ? mix(C.chipGreyText, C.chipVioletText, lit) : C.chipGreyText;
  const liveBg = fr ? C.chipVioletText : C.chipDark;
  const ring = fr ? C.chipVioletText : C.chipDark;
  return (
    <div style={{ position: "relative" }}>
      {/* rings that keep spreading out of the chip while this part is spoken (behind the other chips) */}
      {[0, 0.5].map((offset) => {
        const phase = ((((t - part.from) / 1.2 + offset) % 1) + 1) % 1;
        const spread = 3 + 13 * EASE(phase);
        const k = speaking * (1 - phase);
        return (
          <div
            key={offset}
            style={{
              position: "absolute",
              inset: -spread,
              zIndex: -1,
              borderRadius: 11 + spread,
              border: `2px solid ${alpha(ring, 0.6 * k)}`,
              background: alpha(ring, 0.08 * k),
            }}
          />
        );
      })}
      <div
        style={{
          position: "relative",
          height: 42,
          padding: "0 15px",
          borderRadius: 11,
          display: "flex",
          alignItems: "center",
          fontFamily: MONO,
          fontSize: 20,
          letterSpacing: 1.5,
          opacity: 0.3 + 0.7 * lit,
          background: mix(restBg, liveBg, speaking),
          color: mix(restFg, C.white, speaking),
          transform: `scale(${1 + 0.06 * speaking})`,
          boxShadow: `0 0 0 3px ${alpha(ring, 0.18 * speaking)}`,
        }}
      >
        {part.label}
      </div>
    </div>
  );
};

const InputNode = () => {
  const { t, p } = useTime();
  const a = p(T.node, 0.6);
  // the icon moves like a voice level meter while someone speaks
  const level = Math.max(...PARTS.map((part) => p(part.from, 0.25) * (1 - p(part.to, 0.3))));
  return (
    <div
      style={{
        position: "absolute",
        top: NODE_Y,
        left: CENTER,
        transform: `translateX(-50%) scale(${0.96 + 0.04 * a})`,
        opacity: a,
        height: NODE_H,
        padding: "0 22px 0 30px",
        borderRadius: 20,
        background: C.white,
        display: "flex",
        alignItems: "center",
        gap: 22,
        boxShadow: `0 0 80px ${alpha(C.violet, 0.18)}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4, height: 30 }}>
        {[0.35, 0.6, 0.9, 0.55, 0.8, 0.5, 0.3].map((rest, i) => {
          const voice =
            0.6 * Math.abs(Math.sin(t * (9 + i * 1.7) + i * 2.1)) + 0.4 * Math.abs(Math.sin(t * (4.3 + i * 0.9) + i));
          const h = rest * (1 - level) + level * (0.2 + 0.8 * voice);
          return <div key={i} style={{ width: 4, height: 30 * h, borderRadius: 2, background: "#000" }} />;
        })}
      </div>
      <span style={{ fontFamily: SANS, fontSize: 30, fontWeight: 500, color: "#000", whiteSpace: "nowrap" }}>
        Meeting audio
      </span>
      <div style={{ width: 1, height: 34, background: "#E1E1E1" }} />
      <div style={{ display: "flex", gap: 10 }}>
        {PARTS.map((part, i) => (
          <Chip key={i} part={part} />
        ))}
      </div>
    </div>
  );
};

// trunk from the input node, splitting into one elbow per config. The first wave draws it,
// then every part of the audio travels down it as a short train of light.
const Wires = () => {
  const { p } = useTime();
  const drawn = p(PARTS[0].wire, WIRE_DUR, LINEAR);
  const top = NODE_Y + NODE_H;
  const r = 18;
  const path = (x: number) => {
    const s = x < CENTER ? -1 : 1;
    return `M ${CENTER} ${top} V ${SPLIT_Y - r} Q ${CENTER} ${SPLIT_Y} ${CENTER + s * r} ${SPLIT_Y} H ${x - s * r} Q ${x} ${SPLIT_Y} ${x} ${SPLIT_Y + r} V ${PILL_Y}`;
  };
  // each wave is a comet: slices of the path, brightest at the head
  const train = 0.15;
  const slices = 8;
  const seg = train / slices;
  return (
    <svg width={1600} height={900} style={{ position: "absolute", inset: 0 }}>
      <defs>
        {ROUTES.map((route, i) => (
          <linearGradient key={i} id={`wire${i}`} gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2={PILL_Y}>
            <stop offset="0" stopColor={C.lineViolet} />
            <stop offset="0.45" stopColor={C.line} />
            <stop offset="1" stopColor={route.glow} />
          </linearGradient>
        ))}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {COLUMNS.map((x, i) => (
        <g key={i}>
          <path
            d={path(x)}
            pathLength={1}
            fill="none"
            stroke={`url(#wire${i})`}
            strokeWidth={2}
            strokeDasharray="1 1"
            strokeDashoffset={1 - drawn}
          />
          {PARTS.map((part, k) => {
            const u = p(part.wire, WIRE_DUR, LINEAR) * (1 + train);
            if (u <= 0 || u >= 1 + train) return null;
            return (
              <g key={k} filter="url(#glow)">
                {Array.from({ length: slices }, (_, j) => (
                  <path
                    key={j}
                    d={path(x)}
                    pathLength={1}
                    fill="none"
                    stroke={WAVE[part.lang]}
                    strokeWidth={3.2}
                    strokeLinecap={j === 0 ? "round" : "butt"}
                    strokeOpacity={Math.pow(1 - j / slices, 1.6)}
                    strokeDasharray={`${seg * 1.15} 3`}
                    strokeDashoffset={-(u - (j + 1) * seg)}
                  />
                ))}
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
};

export const CodeSwitchingFlow: React.FC = () => {
  const { p } = useTime();
  const content = 1 - p(T.out, 0.55, SMOOTH);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.page,
        backgroundImage: `radial-gradient(circle, ${C.dot} 1.4px, transparent 1.8px)`,
        backgroundSize: "24px 24px",
        backgroundPosition: "12px 12px",
      }}
    >
      <AbsoluteFill style={{ opacity: content }}>
        <Wires />
        <InputNode />
        {ROUTES.map((route, i) => (
          <Column key={route.value} route={route} x={COLUMNS[i]} />
        ))}
        <Img
          src={staticFile("gladia-logo.svg")}
          style={{ position: "absolute", left: CENTER - 52, bottom: 34, height: 26, opacity: 0.85 * p(0.2, 0.6) }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
