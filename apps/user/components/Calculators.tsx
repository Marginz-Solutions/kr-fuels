"use client";
import { useState } from "react";
import { Fuel, Leaf, TrendingDown, Wind } from "lucide-react";
import type { FuelPricesPublic } from "@/lib/api";
import type { CalculatorSettings } from "@kr/shared/types";

const num = (v: string, d = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
};
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function Calculators({ prices, settings }: { prices: FuelPricesPublic; settings: CalculatorSettings }) {
  const [distance, setDistance] = useState("1000");
  const [mileage, setMileage] = useState("15");
  const [petrolPrice, setPetrolPrice] = useState(String(prices.petrol || 106.89));
  const [lpgPrice, setLpgPrice] = useState(String(prices.autoLPG || 67.5));

  const d = num(distance), m = num(mileage, 1) || 1;
  const pp = num(petrolPrice), lp = num(lpgPrice);
  const lpgMileage = m * (settings.lpgMileageFactor || 0.9);

  const petrolMonthly = (d / m) * pp;
  const lpgMonthly = (d / lpgMileage) * lp;
  const monthlySave = Math.max(0, petrolMonthly - lpgMonthly);
  const annualSave = monthlySave * 12;
  const pct = petrolMonthly > 0 ? Math.round((monthlySave / petrolMonthly) * 100) : 0;

  // carbon
  const petrolLitres = d / m;
  const lpgLitres = d / lpgMileage;
  const petrolCo2M = petrolLitres * (settings.petrolCo2PerL || 2.31);
  const lpgCo2M = lpgLitres * (settings.autoLpgCo2PerL || 1.51);
  const co2SavedM = Math.max(0, petrolCo2M - lpgCo2M);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Savings */}
      <div className="card-soft">
        <div className="mb-5 flex items-center gap-2"><TrendingDown className="text-brand" size={20} /><h3 className="text-lg font-bold text-ink">Savings Calculator</h3></div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Monthly distance (km)" value={distance} onChange={setDistance} />
          <Field label="Petrol mileage (km/L)" value={mileage} onChange={setMileage} />
          <Field label="Petrol price (₹/L)" value={petrolPrice} onChange={setPetrolPrice} />
          <Field label="Auto-LPG price (₹/L)" value={lpgPrice} onChange={setLpgPrice} />
        </div>
        <div className="mt-5 space-y-2 rounded-xl bg-cream p-4 text-sm">
          <Row l="Monthly petrol cost" v={inr(petrolMonthly)} />
          <Row l="Monthly Auto-LPG cost" v={inr(lpgMonthly)} />
          <div className="my-2 border-t border-black/10" />
          <Row l="Monthly savings" v={inr(monthlySave)} strong />
          <Row l="Annual savings" v={inr(annualSave)} strong />
        </div>
        <div className="mt-4 rounded-xl bg-brand px-4 py-3 text-center font-bold text-white">
          Save ~{pct}% by switching to Auto LPG
        </div>
      </div>

      {/* Carbon */}
      <div id="carbon" className="card-soft scroll-mt-28">
        <div className="mb-5 flex items-center gap-2"><Leaf className="text-brand" size={20} /><h3 className="text-lg font-bold text-ink">Carbon Footprint Calculator</h3></div>
        <p className="mb-4 text-sm text-mutedfg">Based on your monthly distance and petrol mileage above.</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-cream p-4">
            <span className="flex items-center gap-2 text-sm font-medium text-ink"><Fuel size={16} /> Petrol CO₂</span>
            <span className="text-right">
              <span className="block font-bold text-ink">{petrolCo2M.toFixed(1)} kg/mo</span>
              <span className="text-xs text-ink/50">{(petrolCo2M * 12).toFixed(0)} kg/yr</span>
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-brand-pale p-4">
            <span className="flex items-center gap-2 text-sm font-medium text-brand"><Leaf size={16} /> Auto-LPG CO₂</span>
            <span className="text-right">
              <span className="block font-bold text-brand">{lpgCo2M.toFixed(1)} kg/mo</span>
              <span className="text-xs text-brand/60">{(lpgCo2M * 12).toFixed(0)} kg/yr</span>
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-lime/30 p-4">
            <span className="flex items-center gap-2 text-sm font-bold text-brand-dark"><Wind size={16} /> CO₂ saved</span>
            <span className="text-right">
              <span className="block font-extrabold text-brand-dark">{co2SavedM.toFixed(1)} kg/mo</span>
              <span className="text-xs text-brand-dark/70">{(co2SavedM * 12).toFixed(0)} kg/yr</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink/60">{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
    </label>
  );
}
function Row({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink/60">{l}</span>
      <span className={strong ? "font-bold text-brand" : "text-ink"}>{v}</span>
    </div>
  );
}
