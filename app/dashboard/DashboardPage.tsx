"use client"
import { useState, type FC } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { MapPin, MessageSquare, Users, HelpCircle, RefreshCw, Edit2, Check, Fuel } from "lucide-react";

import { C }          from "../../constants/colors";
import { chartData, districtData, mockSubmissions } from "../../constants/mockData";
import { card, btn, inp } from "../../styles/shared";
import { StatCard, Badge, Modal, FormField } from "../../components/ui";
import type { FuelPrices } from "../../types";

interface DashboardPageProps {
  prices:      FuelPrices;
  onEditPrice: (p: FuelPrices) => void;
}

type FuelDraft = Record<keyof FuelPrices, string>;

const fuelRows: Array<[keyof FuelPrices, string, "blue" | "amber" | "green", string]> = [
  ["diesel",  "Diesel",   "blue",  "⛽"],
  ["petrol",  "Petrol",   "amber", "🚗"],
  ["autoLPG", "Auto LPG", "green", "🔥"],
];

const DashboardPage: FC<DashboardPageProps> = ({ prices, onEditPrice }) => {
  const [editPrice, setEditPrice] = useState(false);
  const [draft, setDraft] = useState<FuelDraft>({
    diesel:  String(prices.diesel),
    petrol:  String(prices.petrol),
    autoLPG: String(prices.autoLPG),
  });

  const handleSave = () => {
    onEditPrice({ diesel: +draft.diesel, petrol: +draft.petrol, autoLPG: +draft.autoLPG });
    setEditPrice(false);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard icon={<MapPin size={20} />}      label="Total LPG Stations" value="23" sub="+2 this month"       />
        <StatCard icon={<MessageSquare size={20} />} label="Testimonials"     value="18" sub="4.9★ avg rating"     />
        <StatCard icon={<Users size={20} />}        label="Collaborators"     value="12" sub="9 active"            />
        <StatCard icon={<HelpCircle size={20} />}   label="Total FAQs"        value="15" sub="3 updated recently"  />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Area chart */}
        <div style={{ ...card(), padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, color: C.t, fontSize: 15 }}>Activity Overview</div>
              <div style={{ fontSize: 12, color: C.tm }}>Stations · Testimonials · Inquiries</div>
            </div>
            <button style={{ ...btn("ghost"), padding: "5px 10px", fontSize: 12 }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.p}    stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.p}    stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.sDark} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.sDark} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.bd} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.tm }} axisLine={false} tickLine={false} />
              <YAxis                 tick={{ fontSize: 11, fill: C.tm }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.bd}`, fontSize: 12 }} />
              <Area type="monotone" dataKey="stations"  stroke={C.p}    strokeWidth={2} fill="url(#gS)" name="Stations"  />
              <Area type="monotone" dataKey="inquiries" stroke={C.sDark} strokeWidth={2} fill="url(#gI)" name="Inquiries" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Fuel prices */}
        <div style={{ ...card(), padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: C.t, fontSize: 15 }}>Fuel Prices</div>
            <button onClick={() => setEditPrice(true)} style={{ ...btn("ghost"), padding: "4px 10px", fontSize: 12 }}>
              <Edit2 size={12} /> Edit
            </button>
          </div>
          {fuelRows.map(([key, label, , em]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.bd}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{em}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, color: C.t }}>{label}</div>
                  <div style={{ fontSize: 11, color: C.tm }}>per litre</div>
                </div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, color: C.p }}>₹{prices[key]}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: "8px 12px", background: C.pXLight, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: C.tm }}>Verified by</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.p }}>teamkrfuels@gmail.com</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Bar chart */}
        <div style={{ ...card(), padding: 20 }}>
          <div style={{ fontWeight: 600, color: C.t, fontSize: 15, marginBottom: 4 }}>Stations by District</div>
          <div style={{ fontSize: 12, color: C.tm, marginBottom: 14 }}>Active station distribution</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={districtData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.bd} vertical={false} />
              <XAxis dataKey="district" tick={{ fontSize: 11, fill: C.tm }} axisLine={false} tickLine={false} />
              <YAxis                    tick={{ fontSize: 11, fill: C.tm }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.bd}`, fontSize: 12 }} />
              <Bar dataKey="count" fill={C.p} radius={[6, 6, 0, 0]} name="Stations" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent feedback */}
        <div style={{ ...card(), padding: 20 }}>
          <div style={{ fontWeight: 600, color: C.t, fontSize: 15, marginBottom: 14 }}>Recent Feedback</div>
          {mockSubmissions.slice(0, 4).map((s) => (
            <div key={s.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.bd}`, alignItems: "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.pXLight, color: C.p, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                {s.name.charAt(0)}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.t }}>{s.name}</div>
                <div style={{ fontSize: 12, color: C.tm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.message}</div>
              </div>
              <Badge color={s.status === "resolved" ? "green" : s.status === "in_progress" ? "blue" : "amber"}>
                {s.status === "in_progress" ? "Active" : s.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Price Modal */}
      <Modal open={editPrice} title="Edit Fuel Prices" onClose={() => setEditPrice(false)} width={380}>
        {(["diesel", "petrol", "autoLPG"] as const).map((k) => (
          <FormField key={k} label={k === "autoLPG" ? "Auto LPG (₹/L)" : `${k.charAt(0).toUpperCase() + k.slice(1)} (₹/L)`}>
            <input
              style={inp()}
              type="number"
              step="0.01"
              value={draft[k]}
              onChange={(e) => setDraft((p) => ({ ...p, [k]: e.target.value }))}
            />
          </FormField>
        ))}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={btn("ghost")} onClick={() => setEditPrice(false)}>Cancel</button>
          <button style={btn()}        onClick={handleSave}><Check size={14} />Save Prices</button>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
