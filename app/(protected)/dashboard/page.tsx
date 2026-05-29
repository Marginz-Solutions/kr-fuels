import { adminDb } from "@/lib/firebase/admin";
import DashboardClient from "./DashboardClient";
import type { FuelPrices, DashboardData } from "@/types";
import { serverFetch } from "@/lib/server-fetch";

// Fetch initial prices server-side
async function getFuelPrices(): Promise<FuelPrices> {
    const doc = await adminDb.collection("config").doc("fuelPrices").get();
    return doc.exists
        ? (doc.data() as FuelPrices)
        : { diesel: 0, petrol: 0, autoLPG: 0 }; // fallback
}

async function getDashboardData(): Promise<DashboardData> {
    try {
        const res = await serverFetch("/dashboard");
        return res.data;
    } 
    catch(error) {
        console.error("Error fetching dashboard data:", error);
        return {
            stations: { total: 0, active: 0, inactive: 0 },
            feedback: {
                total: 0,
                pending: 0,
                inProgress: 0,
                resolved: 0,
                avgRating: 0,
                safetyAwarenessPercent: 0,
                resolutionRate: 0,
                byCategory: {},
                byStation: []
            },
            enquiries: { total: 0, thisMonth: 0 },
            products: { total: 0, active: 0, categories: 0, byCategory: {} },
            recentFeedback: [],
            recentEnquiries: []
        };
    }
}

export default async function DashboardPageRoute() {
    const [prices, dashboardData] = await Promise.all([
        getFuelPrices(),
        getDashboardData()
    ]);

    return <DashboardClient initialPrices={prices} initialDashboardData={dashboardData} />;
}