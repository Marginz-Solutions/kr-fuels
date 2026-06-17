"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

// Lightweight modal in our theme (no framer-motion). Esc to close, backdrop click,
// body scroll lock. Matches Lovable's modal *flow*, styled with our tokens.
export function Modal({
  open,
  onClose,
  children,
  label,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  label: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="kr-fade-in fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className="kr-pop-in relative my-auto w-full max-w-2xl overflow-x-hidden rounded-3xl border border-line bg-white shadow-[0_24px_60px_rgba(13,26,16,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full text-ink transition hover:bg-cream"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
