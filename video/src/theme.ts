import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadMalayalam } from "@remotion/google-fonts/NotoSansMalayalam";
import { loadFont as loadDevanagari } from "@remotion/google-fonts/NotoSansDevanagari";

const grotesk = loadGrotesk("normal", { weights: ["500", "700"], subsets: ["latin"] });
const serif = loadSerif("italic", { weights: ["400"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] });
const malayalam = loadMalayalam("normal", { weights: ["600"], subsets: ["malayalam"] });
const devanagari = loadDevanagari("normal", { weights: ["600"], subsets: ["devanagari"] });

export const C = {
  paper: "#F3EFE7",
  paperDeep: "#EAE4D8",
  ink: "#121110",
  muted: "#6B655C",
  coral: "#FF5A4E",
  coralSoft: "rgba(255, 90, 78, 0.16)",
  card: "#FFFDF8",
  line: "rgba(18, 17, 16, 0.12)",
};

export const F = {
  head: `${grotesk.fontFamily}, ${malayalam.fontFamily}, ${devanagari.fontFamily}, sans-serif`,
  serif: `${serif.fontFamily}, Georgia, serif`,
  mono: `${mono.fontFamily}, monospace`,
};
