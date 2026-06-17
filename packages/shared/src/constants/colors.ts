// ─── Design Tokens ────────────────────────────────────────
// Single source of truth for all colors used across the app.

export const C = {
  // Primary — Tailwind green-600. SINGLE SOURCE: change `p` (and shades) to recolor.
  p:           "#16a34a", // green-600 (PRIMARY)
  pDark:       "#15803d", // green-700 (hover/active)
  pLight:      "#22c55e", // green-500
  pLightLight: "#4ade80", // green-400
  pXLight:     "#dcfce7", // green-100 tint

  // Secondary (lime)
  s:     "oklch(0.94 0.17 124.44)",
  sDark: "oklch(0.72 0.16 124.44)",

  // Neutrals
  bg:      "#f7f9f7",
  bgGlass: "oklch(0.9066 0.0291 268.52 / 59.06%)",
  white:   "#ffffff",
  bd:      "#e4ede7",
  t:       "#0d1a10",
  tm:      "#52715a",
  tmLight: "oklch(0.62 0.02 185.00)",

  // Semantic
  green:      "#10b981",
  greenLight: "oklch(0.78 0.16 161.50)",
  greenBg:    "#dcfce7",
  greenText:  "#166534",

  amber:      "#f59e0b",
  amberLight: "oklch(0.83 0.15 74.30)",
  amberBg:    "#fef3c7",
  amberText:  "#92400e",

  red:      "#ef4444",
  redLight: "oklch(0.71 0.21 29.20)",
  redBg:    "#fee2e2",
  redText:  "#991b1b",

  blue:      "#3b82f6",
  blueLight: "oklch(0.68 0.17 258.90)",
  blueBg:    "#dbeafe",
  blueText:  "#1e40af",
} as const;
