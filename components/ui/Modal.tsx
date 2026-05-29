import { useState, useEffect } from "react";
import type { FC, ReactNode } from "react";
import { X } from "lucide-react";
import { card, btn } from "../../styles/shared";
import { C } from "../../constants/colors";

// ── types ─────────────────────────────────────────────────
type Breakpoint = "sm" | "md" | "lg";
type SizeMap = Partial<Record<Breakpoint, number>>;

// ── breakpoint thresholds ─────────────────────────────────
const BREAKPOINTS: Record<Breakpoint, number> = {
  sm: 640,
  md: 1024,
  lg: Infinity,
};

// ── helpers ───────────────────────────────────────────────
function parseSizeProp(size?: string): SizeMap {
  if (!size) return {};
  return Object.fromEntries(
    size.split(" ").map((token) => {
      const [bp, val] = token.split("-");
      return [bp, Number(val)];
    })
  );
}

function resolveWidth(map: SizeMap, windowWidth: number): number | undefined {
  for (const bp of ["sm", "md", "lg"] as Breakpoint[]) {
    if (bp in map && windowWidth <= BREAKPOINTS[bp]) return map[bp];
  }
  const defined = (["lg", "md", "sm"] as Breakpoint[]).find((bp) => bp in map);
  return defined ? map[defined] : undefined;
}

function useWindowWidth() {
  const [w, setW] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return w;
}

// ── props ─────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: string;  // e.g. "sm-340 md-500 lg-720"
  width?: number; // fallback default
}

// ── component ─────────────────────────────────────────────
const Modal: FC<ModalProps> = ({
  open,
  title,
  onClose,
  children,
  size,
  width = 500,
}) => {
  const windowWidth   = useWindowWidth();
  const sizeMap       = parseSizeProp(size);
  const resolvedWidth = resolveWidth(sizeMap, windowWidth) ?? width;

  if (!open) return null;

  return (
    <div
      style={{
        position:       "fixed",
        inset:          0,
        background:     "rgba(0,0,0,0.45)",
        zIndex:         1000,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        20,
      }}
    >
      <div
        style={{
          ...card(),
          width:         resolvedWidth,
          maxWidth:      "100%",
          maxHeight:     "90vh",
          display:       "flex",
          flexDirection: "column",
          overflow:      "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "16px 20px",
            borderBottom:   `1px solid ${C.bd}`,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 16, color: C.t }}>{title}</span>
          <button onClick={onClose} style={{ ...btn("ghost"), padding: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;