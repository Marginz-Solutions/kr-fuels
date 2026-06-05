"use client";
import { useEffect, useState } from "react";
import { Sidebar, Topbar } from "@/components/layout";
import { C } from "@/constants/colors";
import { FuelPriceProvider } from "@/components/providers/FuelPriceContext";
import { useIsMobile } from "@/lib/useMediaQuery";
import { Toaster } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close the drawer when crossing to desktop, and lock body scroll while open.
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <FuelPriceProvider>
      {/* height divided by --app-zoom so the shell stays exactly one viewport
          tall under the large-screen/4K zoom (see globals.css). var() falls
          back to 1 (no-op) below 1536px and when the property is unset. */}
      <div style={{
        display:    "flex",
        height:     "calc(100dvh / var(--app-zoom, 1))",
        background: C.bg,
        overflow:   "hidden",
      }}>
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Mobile drawer backdrop */}
        {isMobile && mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
            style={{
              position: "fixed", inset: 0, zIndex: 290,
              background: "rgba(13,26,16,0.45)", backdropFilter: "blur(2px)",
            }}
          />
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <Topbar onMenuClick={() => setMobileOpen(true)} showMenu={isMobile} />
          <main style={{ flex: 1, overflowY: "auto" }}>
            {children}
            <Toaster position="top-right" richColors/>
          </main>
        </div>
      </div>
    </FuelPriceProvider>
  );
}