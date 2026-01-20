export const themeTokens = {
  colors: {
    bg: "#0B1020",
    surface: "#111827",
    surface2: "#171E2E",
    text: "#F5F7FF",
    textSecondary: "#B9C0D4",
    accents: {
      themes: "#C9B3FF",
      knowledge: "#F3F5F7",
      process: "#F4A8B8",
      evaluation: "#F3EE90",
      projects: "#59F06B",
    },
  },
  radius: {
    card: "20px",
    tile: "22px",
    chip: "999px",
  },
  shadow: {
    card: "0 20px 50px rgba(3, 7, 18, 0.35)",
    lift: "0 22px 50px rgba(3, 7, 18, 0.45)",
    nav: "0 18px 50px rgba(3, 7, 18, 0.5)",
  },
  classes: {
    card: "ui-card",
    tile: "ui-tile ui-pressable",
    chip: "ui-chip",
    input: "ui-input",
    nav: "ui-bottomnav",
  },
} as const;

export const cardClasses = "ui-card";
export const tileClasses = "ui-tile ui-pressable";
export const chipClasses = "ui-chip";
