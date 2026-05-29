"use client";

import { useState } from "react";
import DashboardPage from "./DashboardPage";
import type { FuelPrices, DashboardData } from "@/types";
import { toast } from "sonner";
import { useFuelPrices } from "@/components/providers/FuelPriceContext";

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

    const { setPrices: setGlobalPrices } = useFuelPrices();

    async function handleEditPrice(p: FuelPrices) {
        setPrices(p);
        setGlobalPrices(p);

        try {
            await fetch("/api/v1/dashboard/fuel-prices", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(p),
            });
            toast.success("Price Updated");
        }
        catch(error: any) {
            toast.error(error.message);
        }
    }

    async function handleRefresh() {
        setLoading(true);
        try {
            const res = await fetch("/api/v1/dashboard");
            const json = await res.json();
            if(json.success && json.data) {
                setDashboardData(json.data);
            }

            toast.success("Data refreshed...");
        } 
        catch(error: any) {
            toast.error(error.message);
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