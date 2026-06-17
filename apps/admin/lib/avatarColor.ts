// ─── Avatar colour helper ─────────────────────────────────────────────────────
// Deterministic name → colour so every user/avatar gets a consistent, visually
// distinct background. Mirrors the per-name feedback/testimonial avatars: the
// same name always maps to the same colour, different names spread across the
// palette. Use `avatarColor` for solid initials chips, `avatarGradient` for the
// richer testimonial-style monogram.

const PALETTE: { bg: string; fg: string }[] = [
  { bg: "#16a34a", fg: "#ffffff" }, // green-600 (brand)
  { bg: "#0ea5e9", fg: "#ffffff" }, // sky-500
  { bg: "#8b5cf6", fg: "#ffffff" }, // violet-500
  { bg: "#ec4899", fg: "#ffffff" }, // pink-500
  { bg: "#f59e0b", fg: "#ffffff" }, // amber-500
  { bg: "#ef4444", fg: "#ffffff" }, // red-500
  { bg: "#14b8a6", fg: "#ffffff" }, // teal-500
  { bg: "#6366f1", fg: "#ffffff" }, // indigo-500
  { bg: "#0891b2", fg: "#ffffff" }, // cyan-600
  { bg: "#db2777", fg: "#ffffff" }, // pink-600
  { bg: "#7c3aed", fg: "#ffffff" }, // violet-600
  { bg: "#ca8a04", fg: "#ffffff" }, // yellow-600
];

/** Stable non-negative hash of a name (djb2-ish). */
export function nameToHash(name: string): number {
  const s = (name || "?").trim();
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/** Deterministic hue (0–359) from a name — for gradient avatars. */
export function nameToHue(name: string): number {
  return nameToHash(name) % 360;
}

/** Deterministic `{ bg, fg }` pair from a name (white foreground throughout). */
export function avatarColor(name: string): { bg: string; fg: string } {
  return PALETTE[nameToHash(name) % PALETTE.length];
}

/** Deterministic gradient background + readable foreground from a name. */
export function avatarGradient(name: string): { background: string; color: string } {
  const hue = nameToHue(name);
  return {
    background: `linear-gradient(135deg, hsl(${hue},60%,52%), hsl(${(hue + 30) % 360},55%,40%))`,
    color: "#ffffff",
  };
}

/** Up-to-two-letter uppercase initials from a name. */
export function initialsFromName(name: string): string {
  return (
    (name || "")
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}
