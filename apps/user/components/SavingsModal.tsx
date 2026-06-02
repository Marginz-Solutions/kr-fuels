"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Fuel, MapPin } from "lucide-react";
import { Modal } from "./Modal";
import type { FuelPricesPublic } from "@/lib/api";
import type { CalculatorSettings } from "@kr/shared/types";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function SavingsModal({
  open,
  onClose,
  prices,
  settings,
}: {
  open: boolean;
  onClose: () => void;
  prices: FuelPricesPublic;
  settings: CalculatorSettings;
}) {
  const petrol = prices.petrol || 106.89;
  const lpg = prices.autoLPG || 67.5;
  const factor = settings.lpgMileageFactor || 0.9;

  const [km, setKm] = useState(50);
  const [petrolMileage, setPetrolMileage] = useState(15);
  const [lpgMileage, setLpgMileage] = useState(Math.round(15 * factor * 10) / 10);
  const [kitCost, setKitCost] = useState(35000);

  const r = useMemo(() => {
    const petrolDaily = (km / (petrolMileage || 1)) * petrol;
    const lpgDaily = (km / (lpgMileage || 1)) * lpg;
    const daily = Math.max(0, petrolDaily - lpgDaily);
    return { daily, monthly: daily * 30, yearly: daily * 365, roi: daily > 0 ? kitCost / (daily * 30) : 0 };
  }, [km, petrolMileage, lpgMileage, kitCost, petrol, lpg]);

  const field = "mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand";
  const lbl = "text-[11px] font-semibold uppercase tracking-wide text-mutedfg";

  return (
    <Modal open={open} onClose={onClose} label="Savings Calculator">
      <div className="p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-pale text-brand"><Fuel size={20} /></span>
          <h2 className="text-2xl font-extrabold text-ink">Savings Calculator</h2>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block"><span className={lbl}>Daily running (km)</span>
            <input type="number" value={km} onChange={(e) => setKm(+e.target.value)} className={field} /></label>
          <label className="block"><span className={lbl}>Conversion kit cost (₹)</span>
            <input type="number" value={kitCost} onChange={(e) => setKitCost(+e.target.value)} className={field} /></label>
          <label className="block"><span className={lbl}>Petrol mileage (km/l)</span>
            <input type="number" value={petrolMileage} onChange={(e) => setPetrolMileage(+e.target.value)} className={field} /></label>
          <label className="block"><span className={lbl}>Auto LPG mileage (km/l)</span>
            <input type="number" value={lpgMileage} onChange={(e) => setLpgMileage(+e.target.value)} className={field} /></label>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          {([["Daily", r.daily], ["Monthly", r.monthly], ["Yearly", r.yearly]] as const).map(([l, v]) => (
            <div key={l} className="min-w-0 overflow-hidden rounded-2xl bg-brand-pale p-3 text-center sm:p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-mutedfg">{l}</div>
              <div className="mt-1 break-words text-base font-extrabold leading-tight text-brand tabular-nums sm:text-2xl">{inr(v)}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-2xl bg-cream p-4 text-center">
          <div className="text-xs text-mutedfg">Conversion kit ROI</div>
          <div className="mt-1 text-xl font-extrabold text-ink">{r.roi > 0 ? `${r.roi.toFixed(1)} months` : "—"}</div>
        </div>

        <p className="mt-4 text-center text-xs text-mutedfg">
          Live prices — Petrol ₹{petrol}/L · Auto LPG ₹{lpg}/L
        </p>

        <div className="mt-6 flex gap-3">
          <Link href="/stations" onClick={onClose} className="btn-primary flex-1"><MapPin size={16} /> Find Nearest Station</Link>
          <button onClick={onClose} className="btn-outline">Close</button>
        </div>
      </div>
    </Modal>
  );
}
