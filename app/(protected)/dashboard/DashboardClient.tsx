"use client";

import { useState } from "react";
import DashboardPage from "./DashboardPage";
import type { FuelPrices, DashboardData } from "@/types";

export default function DashboardClient({
    initialPrices,
    initialDashboardData
}: {
    initialPrices: FuelPrices;
    initialDashboardData: DashboardData;
}) {
    const [prices, setPrices] = useState<FuelPrices>(initialPrices);
    const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
    const [loading, setLoading] = useState(false);

    async function handleEditPrice(p: FuelPrices) {
        setPrices(p);
        // Save back to Firestore
        await fetch("/api/v1/fuel-prices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(p),
        });
    }

    async function handleRefresh() {
        setLoading(true);
        try {
            const res = await fetch("/api/v1/dashboard");
            const json = await res.json();
            if (json.success && json.data) {
                setDashboardData(json.data);
            }
        } 
        catch(error) {
            console.error("Failed to refresh dashboard:", error);
        } 
        finally {
            setLoading(false);
        }
    }

    return (
        <DashboardPage
            prices={prices}
            onEditPrice={handleEditPrice}
            dashboardData={dashboardData}
            onRefresh={handleRefresh}
            refreshing={loading}
        />
    );
}