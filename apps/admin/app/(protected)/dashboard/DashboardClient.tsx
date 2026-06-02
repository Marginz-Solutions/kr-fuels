"use client";

import { useState } from "react";
import DashboardPage from "./DashboardPage";
import type { FuelPrices, DashboardData } from "@/types";
import { toast } from "sonner";
import { useFuelPrices } from "@/components/providers/FuelPriceContext";
import { useAuth } from "@/components/providers/AuthProvider";
import { displayName } from "@/lib/auth";
import { API_BASE } from "@/lib/api-base";

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
    const { user } = useAuth();
    // First name only, shown once Firebase restores the client session.
    const firstName = user ? displayName(user).split(/\s+/)[0] : undefined;

    async function handleEditPrice(next: FuelPrices) {
        // Optimistically update the card + Topbar badges, but remember the
        // previous values so we can roll back if the server rejects the write.
        const prev = prices;
        setPrices(next);
        setGlobalPrices(next);

        try {
            const res = await fetch(`${API_BASE}/dashboard/fuel-prices`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(next),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error || `Update failed (${res.status})`);
            }
            toast.success("Fuel prices updated");
        }
        catch(error: any) {
            // Revert so the UI reflects what's actually stored, not a phantom save.
            setPrices(prev);
            setGlobalPrices(prev);
            toast.error(error?.message || "Could not update fuel prices");
        }
    }

    async function handleRefresh() {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/dashboard`, { credentials: "include" });
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
            userName={firstName}
        />
    );
}