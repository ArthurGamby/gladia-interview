import { continueRender, delayRender, staticFile } from "remotion";

// Geist et Geist Mono (SIL OFL), embarquées en local comme dans l'intro Hostinger : aucun appel réseau au rendu.
const FONTS = [
  { family: "Geist", file: "fonts/Geist-Variable.woff2" },
  { family: "Geist Mono", file: "fonts/GeistMono-Variable.woff2" },
];

if (typeof document !== "undefined") {
  const handle = delayRender("Chargement des polices Geist");
  Promise.all(FONTS.map(async (f) => {
    const face = new FontFace(f.family, `url('${staticFile(f.file)}') format('woff2')`, { weight: "100 900" });
    document.fonts.add(await face.load());
  }))
    .then(() => continueRender(handle))
    .catch((e) => { console.error(e); continueRender(handle); });
}

export const SANS = "Geist, system-ui, sans-serif";
export const MONO = "'Geist Mono', ui-monospace, monospace";
