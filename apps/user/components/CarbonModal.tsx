"use client";
import { useMemo, useState } from "react";
import { Leaf } from "lucide-react";
import { Modal } from "./Modal";

type Norm = "BS IV" | "BS VI";

// Emission factors mirror krfules.com's Carbon Footprint Calculator. Auto-LPG
// factors are constant; the petrol factors track the selected Bharat Stage norm.
// Tailpipe pollutants (CO, Oxides, Lead) scale with distance (per-km); fuel-bound
// quantities (Sulphur, CO₂) scale with the daily fuel burned (per-litre).
const LPG = { co: 0.3, oxides: 0.05, sulphur: 6, lead: 0, co2: 1.52 };
const PETROL: Record<Norm, { co: number; oxides: number; sulphur: number; lead: number; co2: number }> = {
  "BS IV": { co: 1.0, oxides: 0.18, sulphur: 50, lead: 0.005, co2: 2.16 },
  "BS VI": { co: 1.0, oxides: 0.16, sulphur: 10, lead: 0.005, co2: 2.16 },
};

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

export function CarbonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<"form" | "result">("form");
  const [norm, setNorm] = useState<Norm | "">("");
  const [distance, setDistance] = useState("");
  const [fuel, setFuel] = useState("");

  const rows = useMemo(() => {
    if (!norm) return [];
    const p = PETROL[norm];
    const d = num(distance);
    const f = num(fuel);
    const defs = [
      { label: "Carbon Monoxide", unit: "g", basis: d, pf: p.co, lf: LPG.co },
      { label: "Oxides Discharge (Hydro Carbons + Nitrogen Oxides)", unit: "g", basis: d, pf: p.oxides, lf: LPG.oxides },
      { label: "Sulphur Content - PPM", unit: "PPM (mg/L)", basis: f, pf: p.sulphur, lf: LPG.sulphur },
      { label: "Lead", unit: "g", basis: d, pf: p.lead, lf: LPG.lead },
      { label: "Carbon Dioxide", unit: "kg.eq", basis: f, pf: p.co2, lf: LPG.co2 },
    ];
    return defs.map((x) => {
      const petrol = x.pf * x.basis;
      const lpg = x.lf * x.basis;
      const reduction = petrol > 0 ? ((petrol - lpg) / petrol) * 100 : 0;
      return { label: x.label, unit: x.unit, petrol: petrol.toFixed(2), lpg: lpg.toFixed(2), reduction: reduction.toFixed(2) };
    });
  }, [norm, distance, fuel]);

  const valid = norm !== "" && num(distance) > 0 && num(fuel) > 0;
  const reset = () => { setNorm(""); setDistance(""); setFuel(""); };
  // Modal stays mounted across open/close, so return to the form on close.
  const close = () => { setStep("form"); onClose(); };

  const field = "mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand";
  const lbl = "text-sm font-semibold text-ink";

  return (
    <Modal open={open} onClose={close} label="Carbon Footprint Calculator">
      <div className="p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-pale text-brand"><Leaf size={20} /></span>
          <h2 className="text-2xl font-extrabold text-ink">Carbon Footprint Calculator{step === "result" ? " — Result" : ""}</h2>
        </div>

        {step === "form" ? (
          <>
            <label className="block">
              <span className={lbl}>Select your vehicle&apos;s Bharat Stage compliance: BS IV or BS VI *</span>
              <select value={norm} onChange={(e) => setNorm(e.target.value as Norm)} className={field}>
                <option value="" disabled>Select</option>
                <option value="BS IV">BS IV</option>
                <option value="BS VI">BS VI</option>
              </select>
            </label>

            <label className="mt-5 block">
              <span className={lbl}>Enter the daily distance traveled in kilometers (km) *</span>
              <input type="number" inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} className={field} />
            </label>

            <label className="mt-5 block">
              <span className={lbl}>Enter the quantity of fuel consumed daily (in liters) *</span>
              <input type="number" inputMode="decimal" value={fuel} onChange={(e) => setFuel(e.target.value)} className={field} />
            </label>

            <div className="mt-7 flex gap-3">
              <button onClick={() => valid && setStep("result")} disabled={!valid} className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50">Result</button>
              <button onClick={reset} className="btn-outline">Reset</button>
            </div>
          </>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-brand text-white">
                    <th className="px-4 py-3 font-bold">Carbon Footprints</th>
                    <th className="px-4 py-3 font-bold">Unit</th>
                    <th className="px-4 py-3 font-bold">Auto LPG</th>
                    <th className="px-4 py-3 font-bold">Petrol - {norm}</th>
                    <th className="px-4 py-3 font-bold">Percentage Reduction</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.label} className={i % 2 ? "bg-cream" : "bg-white"}>
                      <td className="px-4 py-3 font-semibold text-ink">{r.label}</td>
                      <td className="px-4 py-3 text-ink/70">{r.unit}</td>
                      <td className="px-4 py-3 font-semibold text-brand tabular-nums">{r.lpg}</td>
                      <td className="px-4 py-3 text-ink/70 tabular-nums">{r.petrol}</td>
                      <td className="px-4 py-3"><span className="inline-block rounded-full bg-brand-pale px-2.5 py-1 text-xs font-bold text-brand tabular-nums">{r.reduction}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-7 flex gap-3">
              <button onClick={close} className="btn-primary flex-1">Close</button>
              <button onClick={() => setStep("form")} className="btn-outline">Back</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
