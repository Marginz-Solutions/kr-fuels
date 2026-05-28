"use client"

import { btn } from "@/styles/shared"
import { Tab } from "../ContactPage"
import { C } from "@/constants/colors"

export type TabSwitcherProps = {
  tab:Tab,
  tabOptions: Array<[Tab, string]>,
  setTab: React.Dispatch<React.SetStateAction<Tab>>
}
export const TabSwitcher = ( props : TabSwitcherProps ) => {
  const { tab,setTab, tabOptions } = props
  return (
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
  )
}
