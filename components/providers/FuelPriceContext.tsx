"use client";

import {
    createContext,
    useContext,
    useState,
    use,
    type ReactNode,
} from "react";
import type { FuelPrices } from "@/types";

const defaultFuelPrices = {
    diesel: 0,
    petrol: 0,
    autoLPG: 0
} as const;

interface FuelPriceContextValue {
    pricesPromise: Promise<FuelPrices>;
    setPrices: (p: FuelPrices) => void;
    refresh: () => void;
}

const fetchFuelPrices = async (): Promise<FuelPrices> => {
    return fetch("/api/v1/dashboard/fuel-prices")
        .then((r) => r.json())
        .then((j) => (j?.data as FuelPrices) ?? defaultFuelPrices)
        .catch(() => defaultFuelPrices);
}


const FuelPriceContext = createContext<FuelPriceContextValue>({
    pricesPromise: Promise.resolve(defaultFuelPrices),
    setPrices: () => {},
    refresh: () => {},
});

export function FuelPriceProvider({ children }: { children: ReactNode }) {
    const [pricesPromise, setPromise] = useState<Promise<FuelPrices>>(() => fetchFuelPrices(),);

    // Solely for the refresh
    const refresh = () => {
        setPromise(fetchFuelPrices());
    }

    const setPrices = (p: FuelPrices) => {
        setPromise(Promise.resolve(p));
    }

    return (
        <FuelPriceContext value={{ pricesPromise, setPrices, refresh }}>
            {children}
        </FuelPriceContext>
    );
}

// Hook
export const useFuelPrices = (): FuelPriceContextValue => useContext(FuelPriceContext);

export const useFuelPricesResolved = (): FuelPrices => {
    const { pricesPromise } = useFuelPrices();
    return use(pricesPromise);
}
