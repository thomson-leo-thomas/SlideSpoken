export const THEME_NAMES = ["midnight", "ocean", "forest", "sunset", "ember", "royal", "neon", "paper"] as const;
export type ThemeName = (typeof THEME_NAMES)[number];
export type ThemeFont = "rounded" | "grotesk" | "serif";

export interface Theme {
  label: string;
  /** Topics the theme suits; shown to the model when it picks a theme. */
  mood: string;
  bg: readonly [string, string, string];
  fg: string;
  muted: string;
  accent: string;
  accent2: string;
  surface: string;
  border: string;
  font: ThemeFont;
}

export const THEMES: Record<ThemeName, Theme> = {
  midnight: {
    label: "Midnight",
    mood: "general, mixed or unclear topics",
    bg: ["#141827", "#0f1220", "#1d1336"],
    fg: "#eef0ff",
    muted: "#a5abc9",
    accent: "#818cf8",
    accent2: "#e879f9",
    surface: "rgba(129,140,248,0.10)",
    border: "rgba(129,140,248,0.28)",
    font: "rounded",
  },
  ocean: {
    label: "Ocean",
    mood: "technology, science, software, data, water, space",
    bg: ["#06182b", "#0a2540", "#062a3a"],
    fg: "#e6f6ff",
    muted: "#9cc3d9",
    accent: "#38bdf8",
    accent2: "#2dd4bf",
    surface: "rgba(56,189,248,0.10)",
    border: "rgba(56,189,248,0.30)",
    font: "grotesk",
  },
  forest: {
    label: "Forest",
    mood: "environment, climate, nature, agriculture, health, wellbeing",
    bg: ["#071a12", "#0b2418", "#16261a"],
    fg: "#ecfdf3",
    muted: "#a3cbb4",
    accent: "#34d399",
    accent2: "#bef264",
    surface: "rgba(52,211,153,0.10)",
    border: "rgba(52,211,153,0.28)",
    font: "rounded",
  },
  sunset: {
    label: "Sunset",
    mood: "travel, culture, food, festivals, people, stories",
    bg: ["#2a0f1c", "#3a1424", "#2b1206"],
    fg: "#fff1ec",
    muted: "#e6b5a8",
    accent: "#fb923c",
    accent2: "#f472b6",
    surface: "rgba(251,146,60,0.10)",
    border: "rgba(251,146,60,0.30)",
    font: "rounded",
  },
  ember: {
    label: "Ember",
    mood: "business, finance, sales, sports, competition, urgency",
    bg: ["#1c0b0b", "#2a1010", "#24150a"],
    fg: "#fff4ee",
    muted: "#d9ab9c",
    accent: "#f87171",
    accent2: "#fbbf24",
    surface: "rgba(248,113,113,0.10)",
    border: "rgba(248,113,113,0.30)",
    font: "grotesk",
  },
  royal: {
    label: "Royal",
    mood: "history, literature, art, leadership, philosophy, awards",
    bg: ["#170f2b", "#21123a", "#2a1a12"],
    fg: "#fbf5ff",
    muted: "#c9b7dd",
    accent: "#c084fc",
    accent2: "#fcd34d",
    surface: "rgba(192,132,252,0.10)",
    border: "rgba(192,132,252,0.30)",
    font: "serif",
  },
  neon: {
    label: "Neon",
    mood: "AI, gaming, startups, innovation, the future",
    bg: ["#05040d", "#0d0820", "#03141a"],
    fg: "#f5f3ff",
    muted: "#a49ec7",
    accent: "#22d3ee",
    accent2: "#f0abfc",
    surface: "rgba(34,211,238,0.08)",
    border: "rgba(34,211,238,0.32)",
    font: "grotesk",
  },
  paper: {
    label: "Paper",
    mood: "education, teaching, research, how-to, explanations",
    bg: ["#fbf7ef", "#f4ede0", "#efe6d6"],
    fg: "#1f1a14",
    muted: "#6b5f50",
    accent: "#d97706",
    accent2: "#2563eb",
    surface: "rgba(217,119,6,0.08)",
    border: "rgba(31,26,20,0.14)",
    font: "serif",
  },
};

export const DEFAULT_THEME: ThemeName = "midnight";

const FONT_STACKS: Record<ThemeFont, string> = {
  rounded: "var(--font-outfit)",
  grotesk: "var(--font-grotesk)",
  serif: "var(--font-serif)",
};

export function themeFor(name: ThemeName | undefined): Theme {
  return THEMES[name ?? DEFAULT_THEME] ?? THEMES[DEFAULT_THEME];
}

/** CSS custom properties consumed by the slide components (see SlideView). */
export function themeVars(name: ThemeName | undefined): Record<string, string> {
  const t = themeFor(name);
  return {
    "--s-bg0": t.bg[0],
    "--s-bg1": t.bg[1],
    "--s-bg": `linear-gradient(135deg, ${t.bg[0]}, ${t.bg[1]} 55%, ${t.bg[2]})`,
    "--s-fg": t.fg,
    "--s-muted": t.muted,
    "--s-accent": t.accent,
    "--s-accent2": t.accent2,
    "--s-surface": t.surface,
    "--s-border": t.border,
    "--s-font": `${FONT_STACKS[t.font]}, var(--font-malayalam), var(--font-devanagari), ui-sans-serif, system-ui, sans-serif`,
  };
}
