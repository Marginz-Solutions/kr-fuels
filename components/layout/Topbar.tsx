"use client";
import { type FC, Suspense, use } from "react";
import { Fuel } from "lucide-react";
import { C } from "../../constants/colors";
import { pill } from "../../styles/shared";
import type { FuelPrices } from "../../types";
import { useFuelPrices } from "@/components/providers/FuelPriceContext";

const fuelBadges: Array<[keyof FuelPrices, string, "blue" | "amber" | "green"]> = [
    ["diesel", "Diesel", "blue"],
    ["petrol", "Petrol", "amber"],
    ["autoLPG", "Auto LPG", "green"],
];

function FuelBadgesSkeleton() {
    return (
        <div style={{ display: "flex", gap: 6 }}>
            {fuelBadges.map(([key, , color]) => (
                <div
                    key={key}
                    style={{
                        ...pill(color),
                        padding: "4px 10px",
                        fontSize: 11,
                        opacity: 0.35,
                        userSelect: "none",
                    }}
                >
                    <Fuel size={10} style={{ marginRight: 4 }} />
                    ₹ —/L
                </div>
            ))}
        </div>
    );
}

function FuelBadges() {
    const { pricesPromise } = useFuelPrices();
    const prices = use(pricesPromise);

    return (
        <div style={{ display: "flex", gap: 6 }}>
            {fuelBadges.map(([key, label, color]) => (
                <div key={key} style={{ ...pill(color), padding: "4px 10px", fontSize: 11 }}>
                    <Fuel size={10} style={{ marginRight: 4 }} />
                    ₹{prices[key]}/{label === "Auto LPG" ? "L" : "L"}
                </div>
            ))}
        </div>
    );
}

const Topbar: FC = () => {

    return (
        <header
            style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "0 24px",
                height: 64,
                background: C.white,
                borderBottom: `1px solid ${C.bd}`,
                flexShrink: 0,
                position: "sticky",
                top: 0,
                zIndex: 100,
                justifyContent: 'end'
            }}
        >
            <Suspense fallback={<FuelBadgesSkeleton />}>
                <FuelBadges />
            </Suspense>

            {/* Avatar */}
            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: C.pXLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.p,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                }}
            >
                KR
            </div>
        </header>
    );
};

export default Topbar;