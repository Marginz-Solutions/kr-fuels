// Shared fuel → label / colour / icon mapping. Single source so the Topbar badges
// and the Dashboard fuel rows always use the SAME distinct icon per fuel.
import { Fuel, Droplet, Leaf, type LucideIcon } from "lucide-react";

export type FuelKey = "diesel" | "petrol" | "autoLPG";

export interface FuelMeta {
  key: FuelKey;
  label: string;
  color: "blue" | "amber" | "green";
  icon: LucideIcon;
}

export const FUEL_META: FuelMeta[] = [
  { key: "diesel", label: "Diesel", color: "blue", icon: Fuel },
  { key: "petrol", label: "Petrol", color: "amber", icon: Droplet },
  { key: "autoLPG", label: "Auto LPG", color: "green", icon: Leaf },
];
