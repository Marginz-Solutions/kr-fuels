"use client";
import { useMemo, useState } from "react";
import { Leaf } from "lucide-react";
import { Modal } from "./Modal";
import type { CalculatorSettings } from "@kr/shared/types";

export function CarbonModal({
  open,
  onClose,
  settings,
}: {
  open: boolean;
  onClose: () => void;
  settings: CalculatorSettings;
}) {
  const [norm, setNorm] = useState<"BS IV" | "BS VI">("BS VI");
  const [fuel, setFuel] = useState(3.5);

  // CO2 factors come from admin-managed calculator-settings; CO/NOx vary by emission
  // norm (sensible defaults, no admin field for these yet).
  const co2 = { petrol: settings.petrolCo2PerL || 2.31, lpg: settings.autoLpgCo2PerL || 1.51 };
  const extra =
    norm === "BS VI"
      ? { co: { petrol: 1.0, lpg: 0.5 }, nox: { petrol: 0.06, lpg: 0.02 } }
      : { co: { petrol: 2.3, lpg: 0.9 }, nox: { petrol: 0.15, lpg: 0.05 } };

  const rows = useMemo(() => {
    const factors: Record<string, { petrol: number; lpg: number }> = { CO2: co2, CO: extra.co, NOx: extra.nox };
    return Object.entries(factors).map(([label, f]) => {
      const p = f.petrol * fuel;
      const l = f.lpg * fuel;
      const reduction = p > 0 ? ((p - l) / p) * 100 : 0;
      return { label, petrol: p.toFixed(2), lpg: l.toFixed(2), reduction: reduction.toFixed(0) };
    });
  }, [co2, extra, fuel]);

  return (
    <Modal open={open} onClose={onClose} label="Carbon Footprint Calculator">
      <div className="p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-pale text-brand"><Leaf size={20} /></span>
          <h2 className="text-2xl font-extrabold text-ink">Carbon Footprint</h2>
        </div>

        <div className="mb-5 flex gap-2">
          {(["BS IV", "BS VI"] as const).map((n) => (
            <button
              key={n}
              onClick={() => setNorm(n)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${norm === n ? "bg-ink text-white" : "bg-cream text-ink hover:bg-brand-pale"}`}
            >
              {n}
            </button>
          ))}
        </div>

        <label className="mb-5 block max-w-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-mutedfg">Daily fuel (liters)</span>
          <input
            type="number"
            value={fuel}
            onChange={(e) => setFuel(+e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
          />
        </label>

        <div className="overflow-hidden rounded-2xl border border-line">
          <div className="grid grid-cols-4 bg-cream px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-mutedfg">
            <div>Emission</div><div>Petrol</div><div>Auto LPG</div><div>Reduction</div>
          </div>
          {rows.map((r, i) => (
            <div key={r.label} className={`grid grid-cols-4 items-center px-4 py-3 text-sm ${i % 2 ? "bg-cream" : "bg-white"}`}>
              <div className="font-semibold text-ink">{r.label}</div>
              <div className="text-ink/70">{r.petrol} kg</div>
              <div className="font-semibold text-brand">{r.lpg} kg</div>
              <div><span className="rounded-full bg-brand-pale px-2 py-0.5 text-xs font-bold text-brand">−{r.reduction}%</span></div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-mutedfg">Per-litre emission comparison · CO₂ factors are admin-managed.</p>

        <div className="mt-6 flex">
          <button onClick={onClose} className="btn-primary flex-1">Got it</button>
        </div>
      </div>
    </Modal>
  );
}
