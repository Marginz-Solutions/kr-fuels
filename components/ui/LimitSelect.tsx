"use client"

import { C } from "@/constants/colors"
import { ChevronDown } from "lucide-react"

type LimitSelectProps = {
  value: number
  onChange: (limit: number) => void
  options?: number[]
}

const LimitSelect = ({ value, onChange, options = [10, 20, 50] }: LimitSelectProps) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: C.tm, whiteSpace: "nowrap" }}>Rows per page</span>
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            height: 32,
            paddingLeft: 10,
            paddingRight: 28,
            fontSize: 12,
            fontWeight: 500,
            color: C.t,
            background: C.white,
            border: `1px solid ${C.bd}`,
            borderRadius: 8,
            cursor: "pointer",
            outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
            fontFamily: "inherit",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = C.p
            e.currentTarget.style.boxShadow = `0 0 0 3px ${C.p}1a`
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = C.bd
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown
          size={12}
          style={{
            position: "absolute",
            right: 8,
            pointerEvents: "none",
            color: C.tm,
          }}
        />
      </div>
    </div>
  )
}

export default LimitSelect