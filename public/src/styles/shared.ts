import type { CSSProperties } from "react";
import { C } from "../constants/colors";
import type { BadgeColor } from "../types";

// ─── Layout helpers ───────────────────────────────────────

export const card = (extra: CSSProperties = {}): CSSProperties => ({
  background:   C.white,
  borderRadius: 16,
  border:       `1px solid ${C.bd}`,
  boxShadow:    "0 2px 8px rgba(0,0,0,0.05)",
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

export const btn = (
  variant: BtnVariant = "primary",
  extra: CSSProperties = {}
): CSSProperties => ({
  background:  btnBg[variant],
  color:       btnColor[variant],
  border:      variant === "ghost" ? `1px solid ${C.bd}` : "none",
  borderRadius: 10,
  padding:     "8px 16px",
  cursor:      "pointer",
  fontWeight:  500,
  fontSize:    14,
  display:     "inline-flex",
  alignItems:  "center",
  gap:         6,
  fontFamily:  "inherit",
  transition:  "opacity 0.15s",
  whiteSpace:  "nowrap",
  ...extra,
});

// ─── Input ────────────────────────────────────────────────

export const inp = (extra: CSSProperties = {}): CSSProperties => ({
  width:       "100%",
  padding:     "9px 12px",
  borderRadius: 10,
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
  fontWeight:   500,
  color:        C.t,
  marginBottom: 4,
  display:      "block",
};

// ─── Badge / Pill ─────────────────────────────────────────

type PillPalette = [bg: string, color: string];

const pillMap: Record<BadgeColor, PillPalette> = {
  green: [C.greenBg, C.greenText],
  amber: [C.amberBg, C.amberText],
  red:   [C.redBg,   C.redText],
  blue:  [C.blueBg,  C.blueText],
};

export const pill = (color: BadgeColor): CSSProperties => {
  const [bg, cl] = pillMap[color] ?? [C.pXLight, C.p];
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
