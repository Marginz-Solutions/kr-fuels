"use client";
import { useEffect, useState } from "react";
import { Calculator, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { C } from "../../../constants/colors";
import { card, btn, inp } from "../../../styles/shared";
import { authedGet, authedSend } from "@/lib/authed-fetch";
import type { CalculatorSettings } from "@/types";

const FIELDS: Array<{ key: keyof CalculatorSettings; label: string; hint: string }> = [
  { key: "lpgMileageFactor", label: "LPG mileage factor", hint: "LPG mileage ≈ factor × petrol mileage (default 0.9)" },
  { key: "petrolCo2PerL", label: "Petrol CO₂ (kg/L)", hint: "Emission factor for petrol (default 2.31)" },
  { key: "autoLpgCo2PerL", label: "Auto-LPG CO₂ (kg/L)", hint: "Emission factor for Auto-LPG (default 1.51)" },
];

export default function CalculatorSettingsPage() {
  const [data, setData] = useState<CalculatorSettings>({ lpgMileageFactor: 0.9, petrolCo2PerL: 2.31, autoLpgCo2PerL: 1.51 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authedGet<{ data: CalculatorSettings }>("/calculator-settings")
      .then((r) => setData((d) => ({ ...d, ...r.data })))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await authedSend("/calculator-settings", "PUT", {
        lpgMileageFactor: Number(data.lpgMileageFactor),
        petrolCo2PerL: Number(data.petrolCo2PerL),
        autoLpgCo2PerL: Number(data.autoLpgCo2PerL),
      });
      toast.success("Calculator settings saved");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 24, color: C.tm }}>Loading…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${C.p}15`, display: "flex", alignItems: "center", justifyContent: "center", color: C.p }}><Calculator size={18} /></div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.t }}>Calculator Settings</div>
          <div style={{ fontSize: 12, color: C.tm }}>Constants used by the website Savings & Carbon calculators.</div>
        </div>
      </div>

      <div style={{ ...card(), padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
        {FIELDS.map((f) => (
          <div key={String(f.key)}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.t, marginBottom: 4 }}>{f.label}</div>
            <input
              style={{ ...inp(), width: "100%" }}
              type="number"
              step="0.01"
              value={String(data[f.key] ?? "")}
              onChange={(e) => setData((d) => ({ ...d, [f.key]: e.target.value as any }))}
            />
            <div style={{ fontSize: 11, color: C.tm, marginTop: 4 }}>{f.hint}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <button style={btn()} onClick={save} disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save settings</button>
      </div>
    </div>
  );
}
