import type { CSSProperties } from "react";
import { C } from "../constants/colors";
import type { BadgeColor } from "../types";

// ─── Layout helpers ───────────────────────────────────────

// Mirrors the public site's `.card-soft` (rounded-2xl + soft ink-tinted shadow).
export const card = (extra: CSSProperties = {}): CSSProperties => ({
  background:   C.white,
  borderRadius: 20,
  border:       `1px solid ${C.bd}`,
  boxShadow:    "0 2px 18px rgba(26,46,41,0.05)",
  ...extra,
});

// ─── Button variants ──────────────────────────────────────

type BtnVariant = "primary" | "secondary" | "danger" | "ghost";

const btnBg: Record<BtnVariant, string> = {
  primary:   C.p,
  secondary: C.s,
  danger:    C.red,
  ghost:     "transparent",
};

const btnColor: Record<BtnVariant, string> = {
  primary:   C.white,
  secondary: C.t,
  danger:    C.white,
  ghost:     C.tm,
};

// Pill buttons matching the public site (rounded-full, bold-ish, compact).
export const btn = (
  variant: BtnVariant = "primary",
  extra: CSSProperties = {}
): CSSProperties => ({
  background:  btnBg[variant],
  color:       btnColor[variant],
  border:      variant === "ghost" ? `1px solid ${C.bd}` : "none",
  borderRadius: 9999,
  padding:     "8px 18px",
  cursor:      "pointer",
  fontWeight:  600,
  fontSize:    14,
  display:     "inline-flex",
  alignItems:  "center",
  gap:         6,
  fontFamily:  "inherit",
  transition:  "background 0.15s, opacity 0.15s, box-shadow 0.15s",
  whiteSpace:  "nowrap",
  ...extra,
});

// Circular icon-only button — equal width/height, zero padding, flex-centered
// content and a full pill radius so the glyph sits dead-centre in a true circle.
export const iconBtn = (
  variant: BtnVariant = "ghost",
  size = 30,
  extra: CSSProperties = {}
): CSSProperties => ({
  ...btn(variant),
  width:          size,
  height:         size,
  minWidth:       size,
  minHeight:      size,
  maxWidth:       size,
  maxHeight:      size,
  padding:        0,
  borderRadius:   9999,
  boxSizing:      "border-box",
  lineHeight:     1,
  display:        "inline-flex",
  alignItems:     "center",
  justifyContent: "center",
  flexShrink:     0,
  ...extra,
});

// ─── Input ────────────────────────────────────────────────

export const inp = (extra: CSSProperties = {}): CSSProperties => ({
  width:       "100%",
  padding:     "10px 14px",
  borderRadius: 12,
  border:      `1px solid ${C.bd}`,
  fontSize:    14,
  fontFamily:  "inherit",
  outline:     "none",
  background:  C.white,
  color:       C.t,
  boxSizing:   "border-box",
  ...extra,
});

// ─── Label ────────────────────────────────────────────────

export const lbl: CSSProperties = {
  fontSize:     13,
  fontWeight:   600,
  color:        C.t,
  marginBottom: 6,
  display:      "block",
};

// ─── Badge / Pill ─────────────────────────────────────────

type PillPalette = [bg: string, color: string];

const pillMap: Record<BadgeColor, PillPalette> = {
  green: [C.p,     C.white],
  amber: [C.amberBg, C.amberText],
  red:   [C.redBg,   C.redText],
  blue:  [C.blueBg,  C.blueText],
};

export const pill = (color: BadgeColor): CSSProperties => {
  const [bg, cl] = pillMap[color] ?? [C.p, C.white];
  return {
    display:       "inline-flex",
    alignItems:    "center",
    padding:       "2px 10px",
    borderRadius:  20,
    fontSize:      11,
    fontWeight:    600,
    background:    bg,
    color:         cl,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };
};
