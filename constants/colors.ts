// ─── Design Tokens ────────────────────────────────────────
// Single source of truth for all colors used across the app.

export const C = {
  // Primary (teal-green)
  p:       "oklch(0.43 0.06 172.08)",
  pDark:   "oklch(0.32 0.07 172.08)",
  pLight:  "oklch(0.58 0.08 172.08)",
  pXLight: "oklch(0.92 0.04 172.08)",

  // Secondary (lime)
  s:     "oklch(0.94 0.17 124.44)",
  sDark: "oklch(0.72 0.16 124.44)",

  // Neutrals
  bg:    "#f0f5f3",
  white: "#ffffff",
  bd:    "#e2e8f0",
  t:     "#1a2e29",
  tm:    "#5a7872",

  // Semantic
  green:     "#10b981",
  greenBg:   "#dcfce7",
  greenText: "#166534",

  amber:     "#f59e0b",
  amberBg:   "#fef3c7",
  amberText: "#92400e",

  red:     "#ef4444",
  redBg:   "#fee2e2",
  redText: "#991b1b",

  blue:     "#3b82f6",
  blueBg:   "#dbeafe",
  blueText: "#1e40af",
} as const;
