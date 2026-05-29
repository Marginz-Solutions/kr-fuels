"use client";
import { useState } from "react";
import { Sidebar, Topbar } from "@/components/layout";
import { C } from "@/constants/colors";
import { FuelPriceProvider } from "@/components/providers/FuelPriceContext";
import { Toaster } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <FuelPriceProvider>
      <div style={{
        display:    "flex",
        height:     "100vh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: C.bg,
        overflow:   "hidden",
      }}>
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <Topbar />
          <main style={{ flex: 1, overflowY: "auto" }}>
            {children}
            <Toaster position="top-right" richColors/>
          </main>
        </div>
      </div>
    </FuelPriceProvider>
  );
}