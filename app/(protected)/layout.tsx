"use client";
import { useState } from "react";
import { Sidebar, Topbar } from "@/components/layout";
import { C } from "@/constants/colors";
import { defaultFuelPrices } from "@/constants/mockData";
import type { FuelPrices } from "@/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [prices, setPrices] = useState<FuelPrices>(defaultFuelPrices);

  return (
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
        <Topbar fuels={prices} /> {/* page prop removed ✅ */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}