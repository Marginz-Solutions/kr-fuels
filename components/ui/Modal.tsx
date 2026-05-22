import type { FC, ReactNode } from "react";
import { X } from "lucide-react";
import { card, btn } from "../../styles/shared";
import { C } from "../../constants/colors";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

const Modal: FC<ModalProps> = ({ open, title, onClose, children, width = 500 }) => {
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
          width,
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
