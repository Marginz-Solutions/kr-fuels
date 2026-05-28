"use client"

import { FormField } from "@/components/ui"
import { C } from "@/constants/colors"
import { btn, card, inp } from "@/styles/shared"
import { AdminContactPresents } from "@/types/dust"
import { Loader2, Save, MapPin, Share2 } from "lucide-react"

export type PresentsCardProps = {
  presents: AdminContactPresents
  setPresents: React.Dispatch<React.SetStateAction<AdminContactPresents | null>>
  savingPre: boolean
  savePresents: () => Promise<void>
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: C.green ?? "#888",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 10,
}

const cardHeader = (iconBg: string, iconColor: string, icon: React.ReactNode, title: string, subtitle: string) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "16px 20px", borderBottom: "0.5px solid rgba(0,0,0,0.08)",
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: iconBg,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ color: iconColor, display: "flex" }}>{icon}</span>
    </div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.t }}>{title}</div>
      <div style={{ fontSize: 11, color: C.green ?? "#888", marginTop: 1 }}>{subtitle}</div>
    </div>
  </div>
)

const SOCIAL_PLATFORMS = [
  {
    key: "facebook" as const,
    label: "Facebook",
    iconBg: "rgba(21,94,165,0.1)",
    iconColor: "#185EA5",
    icon: "f",
  },
  {
    key: "instagram" as const,
    label: "Instagram",
    iconBg: "rgba(153,53,86,0.1)",
    iconColor: "#993556",
    icon: "ig",
  },
  {
    key: "twitter" as const,
    label: "Twitter / X",
    iconBg: "rgba(15,110,86,0.1)",
    iconColor: "#0F6E56",
    icon: "x",
  },
  {
    key: "youtube" as const,
    label: "YouTube",
    iconBg: "rgba(163,45,45,0.1)",
    iconColor: "#A32D2D",
    icon: "yt",
  },
]

const PresentsCard = (props: PresentsCardProps) => {
  const { presents, setPresents, savingPre, savePresents } = props

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Address card */}
      <div style={{ ...card(), overflow: "hidden", padding: 0 }}>
        {cardHeader(
          "rgba(15,110,86,0.1)", "#0F6E56",
          <MapPin size={16} />,
          "Address",
          "Physical location & coordinates",
        )}

        <div style={{ padding: "20px 20px 0" }}>
          <div style={sectionLabel}>Location</div>
          <FormField label="Street">
            <input style={inp()} value={presents.address.street}
              onChange={(e) => setPresents({ ...presents, address: { ...presents.address, street: e.target.value } })} />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
            <FormField label="City">
              <input style={inp()} value={presents.address.city}
                onChange={(e) => setPresents({ ...presents, address: { ...presents.address, city: e.target.value } })} />
            </FormField>
            <FormField label="State">
              <input style={inp()} value={presents.address.state}
                onChange={(e) => setPresents({ ...presents, address: { ...presents.address, state: e.target.value } })} />
            </FormField>
            <FormField label="Pincode">
              <input style={inp()} value={presents.address.pincode}
                onChange={(e) => setPresents({ ...presents, address: { ...presents.address, pincode: e.target.value } })} />
            </FormField>
          </div>

          <div style={{
            height: "0.5px", background: "rgba(0,0,0,0.08)", margin: "4px 0 16px",
          }} />
          <div style={sectionLabel}>Coordinates</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Latitude">
              <input style={{ ...inp(), fontFamily: "monospace", fontSize: 12 }}
                value={presents.exactLoaction.lat}
                onChange={(e) => setPresents({ ...presents, exactLoaction: { ...presents.exactLoaction, lat: e.target.value } })} />
            </FormField>
            <FormField label="Longitude">
              <input style={{ ...inp(), fontFamily: "monospace", fontSize: 12 }}
                value={presents.exactLoaction.lng}
                onChange={(e) => setPresents({ ...presents, exactLoaction: { ...presents.exactLoaction, lng: e.target.value } })} />
            </FormField>
          </div>
        </div>

        <div style={{ padding: "14px 20px", marginTop: 20, borderTop: "0.5px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)" }}>
          {/* footer placeholder — save is shared below */}
        </div>
      </div>

      {/* Social links card */}
      <div style={{ ...card(), overflow: "hidden", padding: 0 }}>
        {cardHeader(
          "rgba(186,117,23,0.1)", "#BA7517",
          <Share2 size={16} />,
          "Social media links",
          "Public profile URLs",
        )}

        <div style={{ padding: "12px 20px" }}>
          {SOCIAL_PLATFORMS.map((platform, i) => (
            <div key={platform.key} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 0",
              borderBottom: i < SOCIAL_PLATFORMS.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                background: platform.iconBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: platform.iconColor,
                letterSpacing: "-0.02em",
              }}>
                {platform.icon.toUpperCase().slice(0, 2)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.green ?? "#888", minWidth: 72, flexShrink: 0 }}>
                {platform.label}
              </span>
              <input
                style={{ ...inp(), flex: 1, fontSize: 12 }}
                value={presents.socialLinks[platform.key]}
                placeholder={`https://${platform.key === "twitter" ? "x" : platform.key}.com/...`}
                onChange={(e) => setPresents({
                  ...presents,
                  socialLinks: { ...presents.socialLinks, [platform.key]: e.target.value },
                })}
              />
            </div>
          ))}
        </div>

        <div style={{
          padding: "14px 20px",
          borderTop: "0.5px solid rgba(0,0,0,0.08)",
          background: "rgba(0,0,0,0.02)",
        }}>
          <button style={{ ...btn(), opacity: savingPre ? 0.7 : 1 }} onClick={savePresents} disabled={savingPre}>
            {savingPre
              ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              : <Save size={14} />}
            Save address & social links
          </button>
        </div>
      </div>
    </div>
  )
}

export default PresentsCard