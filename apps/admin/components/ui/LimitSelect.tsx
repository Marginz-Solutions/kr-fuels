"use client"

import { C } from "@/constants/colors"
import Select from "./Select"

type LimitSelectProps = {
  value: number
  onChange: (limit: number) => void
  options?: number[]
}

// "Rows per page" picker — thin wrapper over the shared <Select> so pagination
// controls share the exact same dropdown look as every other admin select.
const LimitSelect = ({ value, onChange, options = [10, 20, 50] }: LimitSelectProps) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: C.tm, whiteSpace: "nowrap" }}>Rows per page</span>
      <Select
        size="sm"
        searchable={false}
        ariaLabel="Rows per page"
        minWidth={72}
        value={String(value)}
        onChange={(v) => onChange(Number(v))}
        options={options.map(String)}
      />
    </div>
  )
}

export default LimitSelect
