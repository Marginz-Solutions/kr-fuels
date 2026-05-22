import { adminDb } from "@/lib/firebase/admin";
import DashboardClient from "./DashboardClient";
import type { FuelPrices } from "@/types";

// Fetch initial prices server-side
async function getFuelPrices(): Promise<FuelPrices> {
  const doc = await adminDb.collection("config").doc("fuelPrices").get();
  return doc.exists
    ? (doc.data() as FuelPrices)
    : { diesel: 0, petrol: 0, autoLPG: 0 }; // fallback
}

export default async function DashboardPageRoute() {
  const prices = await getFuelPrices();
  return <DashboardClient initialPrices={prices} />;
}