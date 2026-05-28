"use client"

import { FormField } from "@/components/ui"
import { C } from "@/constants/colors"
import { btn, card, inp } from "@/styles/shared"
import { AdminContactEssentials } from "@/types/dust"
import { Loader2, Save, Building2, Mail, Phone } from "lucide-react"

export type EssentialsCardProps = {
  essentials: AdminContactEssentials
  setEssentials: React.Dispatch<React.SetStateAction<AdminContactEssentials | null>>
  savingEss: boolean
  saveEssentials: () => Promise<void>
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: C.green ?? "#888",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 10,
}

const divider: React.CSSProperties = {
  height: "0.5px",
  background: "rgba(0,0,0,0.08)",
  margin: "4px 0 16px",
}

const inputWrap: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
}

const iconStyle: React.CSSProperties = {
  position: "absolute",
  left: 10,
  color: C.green ?? "#aaa",
  pointerEvents: "none",
  display: "flex",
}

const EssentialsCard = (props: EssentialsCardProps) => {
  const { essentials, setEssentials, savingEss, saveEssentials } = props

  return (
    <div style={{ ...card(), overflow: "hidden", padding: 0 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "16px 20px", borderBottom: "0.5px solid rgba(0,0,0,0.08)",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "rgba(21,101,192,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Building2 size={16} color="#1565C0" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.t }}>Company information</div>
          <div style={{ fontSize: 11, color: C.green ?? "#888", marginTop: 1 }}>Core details, emails & phone numbers</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 20px 0" }}>

        {/* Identity */}
        <div style={sectionLabel}>Identity</div>
        <FormField label="Company name">
          <input style={inp()} value={essentials.companyName}
            onChange={(e) => setEssentials({ ...essentials, companyName: e.target.value })} />
        </FormField>
        <FormField label="Tagline">
          <input style={inp()} value={essentials.tagline}
            onChange={(e) => setEssentials({ ...essentials, tagline: e.target.value })} />
        </FormField>

        <div style={divider} />

        {/* Emails */}
        <div style={sectionLabel}>Emails</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Info email">
            <div style={inputWrap}>
              <span style={iconStyle}><Mail size={14} /></span>
              <input style={{ ...inp(), paddingLeft: 32 }} value={essentials.emails.info}
                onChange={(e) => setEssentials({ ...essentials, emails: { ...essentials.emails, info: e.target.value } })} />
            </div>
          </FormField>
          <FormField label="Support email">
            <div style={inputWrap}>
              <span style={iconStyle}><Mail size={14} /></span>
              <input style={{ ...inp(), paddingLeft: 32 }} value={essentials.emails.support}
                onChange={(e) => setEssentials({ ...essentials, emails: { ...essentials.emails, support: e.target.value } })} />
            </div>
          </FormField>
        </div>

        <div style={divider} />

        {/* Phone numbers */}
        <div style={sectionLabel}>Phone numbers</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Office phone">
            <div style={inputWrap}>
              <span style={iconStyle}><Phone size={14} /></span>
              <input style={{ ...inp(), paddingLeft: 32 }} value={essentials.phoneNos.office}
                onChange={(e) => setEssentials({ ...essentials, phoneNos: { ...essentials.phoneNos, office: e.target.value } })} />
            </div>
          </FormField>
          <FormField label="WhatsApp">
            <div style={inputWrap}>
              <span style={iconStyle}><Phone size={14} /></span>
              <input style={{ ...inp(), paddingLeft: 32 }} value={essentials.phoneNos.whatsapp}
                onChange={(e) => setEssentials({ ...essentials, phoneNos: { ...essentials.phoneNos, whatsapp: e.target.value } })} />
            </div>
          </FormField>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "14px 20px",
        marginTop: 20,
        borderTop: "0.5px solid rgba(0,0,0,0.08)",
        background: "rgba(0,0,0,0.02)",
      }}>
        <button style={{ ...btn(), opacity: savingEss ? 0.7 : 1 }} onClick={saveEssentials} disabled={savingEss}>
          {savingEss
            ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            : <Save size={14} />}
          Save changes
        </button>
      </div>
    </div>
  )
}

export default EssentialsCard