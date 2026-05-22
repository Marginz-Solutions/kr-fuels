"use client"
import { useState, type FC } from "react";
import { Save } from "lucide-react";
import { Image as ImgIcon } from "lucide-react";

import { C } from "../../../constants/colors";
import { card, btn, inp } from "../../../styles/shared";
import { FormField } from "../../../components/ui";

type SettingsTab = "general" | "fuel" | "hero" | "seo";

const tabOptions: Array<[SettingsTab, string]> = [
  ["general", "General"],
  ["fuel", "Fuel & Savings"],
  ["hero", "Hero Section"],
  ["seo", "SEO / Meta"],
];

const SettingsPage: FC = () => {
  const [tab, setTab] = useState<SettingsTab>("general");

  return (
    <div style={{ padding: 24 }}>
      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 12, padding: 4, marginBottom: 20, width: "fit-content" }}>
        {tabOptions.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              ...btn("ghost"),
              borderRadius: 9,
              padding: "7px 16px",
              fontSize: 13,
              background: tab === k ? C.white : "transparent",
              color: tab === k ? C.t : C.tm,
              border: tab === k ? `1px solid ${C.bd}` : "none",
              boxShadow: tab === k ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div style={{ ...card(), padding: 24, maxWidth: 640 }}>
        {tab === "general" && (
          <>
            <FormField label="Website Name">
              <input style={inp()} defaultValue="KR Fuels" />
            </FormField>
            <FormField label="Tagline">
              <input style={inp()} defaultValue="Tamil Nadu's Trusted Auto LPG Provider" />
            </FormField>
            <FormField label="Footer Text">
              <textarea style={{ ...inp(), height: 80 }} defaultValue="© 2025 KR Fuels. All rights reserved." />
            </FormField>
            <FormField label="Contact Email">
              <input style={inp()} defaultValue="teamkrfuels@gmail.com" />
            </FormField>
          </>
        )}

        {tab === "fuel" && (
          <>
            <FormField label="Auto LPG Savings %">
              <input style={inp()} type="number" defaultValue="38" />
            </FormField>
            <FormField label="Savings Banner Text">
              <input style={inp()} defaultValue="Save up to 38% on fuel costs with Auto LPG!" />
            </FormField>
            <FormField label="Diesel Price (₹/L)">
              <input style={inp()} type="number" step="0.01" defaultValue="87.62" />
            </FormField>
            <FormField label="Petrol Price (₹/L)">
              <input style={inp()} type="number" step="0.01" defaultValue="102.34" />
            </FormField>
            <FormField label="Auto LPG Price (₹/L)">
              <input style={inp()} type="number" step="0.01" defaultValue="49.80" />
            </FormField>
          </>
        )}

        {tab === "hero" && (
          <>
            <FormField label="Hero Headline">
              <input style={inp()} defaultValue="Drive Smarter with Auto LPG" />
            </FormField>
            <FormField label="Hero Subheadline">
              <textarea style={{ ...inp(), height: 80 }} defaultValue="KR Fuels operates 23+ Auto LPG stations across Tamil Nadu. Save more, drive more." />
            </FormField>
            <FormField label="CTA Button Text">
              <input style={inp()} defaultValue="Find Nearest Station" />
            </FormField>
            <FormField label="Hero Background Image">
              <div style={{ border: `2px dashed ${C.bd}`, borderRadius: 12, padding: "20px 0", textAlign: "center", color: C.tm, fontSize: 13 }}>
                <ImgIcon size={22} style={{ margin: "0 auto 8px" }} /><br />
                Upload hero image (1920×1080 recommended)
              </div>
            </FormField>
          </>
        )}

        {tab === "seo" && (
          <>
            <FormField label="Meta Title">
              <input style={inp()} defaultValue="KR Fuels | Auto LPG Stations in Tamil Nadu" />
            </FormField>
            <FormField label="Meta Description">
              <textarea style={{ ...inp(), height: 80 }} defaultValue="KR Fuels — Tamil Nadu's most trusted Auto LPG fuel provider. 23+ stations across major districts." />
            </FormField>
            <FormField label="Keywords">
              <input style={inp()} defaultValue="Auto LPG, CNG, KR Fuels, Tamil Nadu, fuel station" />
            </FormField>
            <FormField label="OG Image">
              <div style={{ border: `2px dashed ${C.bd}`, borderRadius: 12, padding: "16px 0", textAlign: "center", color: C.tm, fontSize: 13 }}>
                <ImgIcon size={20} style={{ margin: "0 auto 6px" }} /><br />
                Upload OG image (1200×630)
              </div>
            </FormField>
          </>
        )}

        <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
          <button style={btn()}><Save size={14} />Save Settings</button>
          <button style={btn("ghost")}>Reset to Default</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
