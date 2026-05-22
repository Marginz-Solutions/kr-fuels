"use client";
import { useState } from "react";
import DashboardPage from "./DashboardPage";
import type { FuelPrices } from "@/types";

export default function DashboardClient({ initialPrices }: { initialPrices: FuelPrices }) {
  const [prices, setPrices] = useState<FuelPrices>(initialPrices);

  async function handleEditPrice(p: FuelPrices) {
    setPrices(p);
    // Save back to Firestore
    await fetch("/api/fuel-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
  }

  return <DashboardPage prices={prices} onEditPrice={handleEditPrice} />;
}