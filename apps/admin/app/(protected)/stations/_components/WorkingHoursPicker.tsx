"use client"
import { useState, type FC, type CSSProperties, type ReactNode } from "react"
import { Clock, Pencil } from "lucide-react"
import { C } from "@/constants/colors"
import { Select } from "@/components/ui"

// Working hours are stored as a free-text string on the station doc (the public
// site renders it verbatim, e.g. "6:00 AM - 10:00 PM"). This picker keeps that
// exact string contract but replaces the raw text box with a guided open/close
// time picker, a quick "Open 24 hours" toggle, and a graceful escape hatch for
// any legacy value that doesn't fit the range shape.

type Props = {
    value: string
    onChange: (next: string) => void
}

type Period = "AM" | "PM"
type Mode = "range" | "24h" | "custom"

type Parsed = {
    mode: Mode
    oH: number; oM: string; oP: Period
    cH: number; cM: string; cP: Period
    custom: string
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)        // 1..12
const MINUTES = ["00", "15", "30", "45"]
const PERIODS: Period[] = ["AM", "PM"]

const DEFAULTS = { oH: 6, oM: "00", oP: "AM" as Period, cH: 10, cM: "00", cP: "PM" as Period }

const RANGE_RE =
    /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–to]+\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i
const TWENTY_FOUR_RE = /24\s*\/?\s*7|24\s*hours|open\s*24/i

// Snap a parsed minute onto the nearest option we offer so the <select> always
// has a matching value (a legacy "6:05" still round-trips cleanly to "00").
const snapMinute = (m: string) => (MINUTES.includes(m) ? m : "00")
const clampHour = (h: number) => (h >= 1 && h <= 12 ? h : 12)

const parse = (value: string): Parsed => {
    const base: Parsed = { mode: "range", ...DEFAULTS, custom: "" }
    const v = (value ?? "").trim()
    if (!v) return base
    if (TWENTY_FOUR_RE.test(v)) return { ...base, mode: "24h" }
    const m = v.match(RANGE_RE)
    if (m) {
        return {
            mode: "range",
            oH: clampHour(Number(m[1])), oM: snapMinute(m[2]), oP: m[3].toUpperCase() as Period,
            cH: clampHour(Number(m[4])), cM: snapMinute(m[5]), cP: m[6].toUpperCase() as Period,
            custom: "",
        }
    }
    // Non-empty but unrecognised — preserve it rather than silently overwriting.
    return { ...base, mode: "custom", custom: v }
}

const rangeString = (s: Parsed) =>
    `${s.oH}:${s.oM} ${s.oP} - ${s.cH}:${s.cM} ${s.cP}`

// Base style shared by the custom free-text fallback input below. The time
// dropdowns themselves use the shared <Select> component for a consistent look.
const selStyle: CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    padding: "8px 28px 8px 12px",
    borderRadius: 10,
    border: `1px solid ${C.bd}`,
    fontSize: 13,
    fontFamily: "inherit",
    background: C.white,
    color: C.t,
    outline: "none",
    cursor: "pointer",
    textAlign: "center",
    textAlignLast: "center",
}

// Fixed columns so the hour ("6" vs "10"), colon, minute and period line up
// vertically across the Open and Close rows regardless of digit count.
const rowGrid: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "48px 1fr 10px 1fr 1fr",
    alignItems: "center",
    columnGap: 8,
}

const linkBtn: CSSProperties = {
    alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer",
    fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, padding: 0,
}

const WorkingHoursPicker: FC<Props> = ({ value, onChange }) => {
    // Seed once from the incoming value; we only emit on a real user interaction so
    // an untouched legacy value is preserved exactly as stored.
    const [s, setS] = useState<Parsed>(() => parse(value))

    // NOTE: we intentionally do NOT auto-commit a default value on mount. The picker
    // shows a sensible default preview, but nothing is saved unless the admin actually
    // sets hours — otherwise every untouched station would get a fabricated
    // "6:00 AM - 10:00 PM" that doesn't match reality. Stations with no operating
    // hours use the "Timing Not Available" toggle instead.

    const update = (patch: Partial<Parsed>) => {
        const next = { ...s, ...patch }
        setS(next)
        if (next.mode === "24h") onChange("Open 24 Hours")
        else if (next.mode === "custom") onChange(next.custom)
        else onChange(rangeString(next))
    }

    // Plain render helper (not a nested component) so the selects keep their
    // identity across renders. `which` picks the open ("o") or close ("c") keys.
    const timeRow = (label: string, which: "o" | "c"): ReactNode => {
        const h = which === "o" ? s.oH : s.cH
        const m = which === "o" ? s.oM : s.cM
        const p = which === "o" ? s.oP : s.cP
        return (
            <div style={rowGrid}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.tm }}>{label}</span>
                <Select size="sm" block searchable={false} ariaLabel={`${label} hour`} value={String(h)} options={[...HOURS]}
                    onChange={v => update({ [`${which}H`]: Number(v) } as Partial<Parsed>)} />
                <span style={{ textAlign: "center", color: C.tm, fontWeight: 700 }}>:</span>
                <Select size="sm" block searchable={false} ariaLabel={`${label} minute`} value={m} options={[...MINUTES]}
                    onChange={v => update({ [`${which}M`]: v } as Partial<Parsed>)} />
                <Select size="sm" block searchable={false} ariaLabel={`${label} period`} value={p} options={[...PERIODS]}
                    onChange={v => update({ [`${which}P`]: v as Period } as Partial<Parsed>)} />
            </div>
        )
    }

    const is24 = s.mode === "24h"

    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: C.t, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={14} color={C.p} /> Working Hours
            </label>

            <div style={{
                border: `1px solid ${C.bd}`,
                borderRadius: 12,
                padding: 12,
                background: C.bg,
                display: "flex",
                flexDirection: "column",
                gap: 10,
            }}>
                {s.mode === "custom" ? (
                    <>
                        <input
                            style={{ ...selStyle, cursor: "text", padding: "8px 12px", textAlign: "left", textAlignLast: "auto" }}
                            value={s.custom}
                            onChange={e => update({ custom: e.target.value })}
                            placeholder="6:00 AM - 10:00 PM"
                        />
                        <button type="button" onClick={() => update({ mode: "range", ...DEFAULTS })} style={{ ...linkBtn, color: C.p }}>
                            <Clock size={12} /> Use time picker
                        </button>
                    </>
                ) : (
                    <>
                        {/* 24-hours quick toggle */}
                        <div style={{ display: "flex", background: C.white, borderRadius: 8, padding: 3, gap: 3, border: `1px solid ${C.bd}` }}>
                            {([["range", "Set hours"], ["24h", "Open 24 hours"]] as const).map(([m, lbl]) => {
                                const active = m === "24h" ? is24 : !is24
                                return (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => update({ mode: m === "24h" ? "24h" : "range" })}
                                        style={{
                                            flex: 1, padding: "6px 0", borderRadius: 6, border: "none", cursor: "pointer",
                                            fontSize: 12, fontWeight: 600, transition: "background 0.15s, color 0.15s",
                                            background: active ? C.p : "transparent",
                                            color: active ? C.white : C.tm,
                                        }}
                                    >
                                        {lbl}
                                    </button>
                                )
                            })}
                        </div>

                        {!is24 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {timeRow("Open", "o")}
                                {timeRow("Close", "c")}
                            </div>
                        )}

                        {/* Live preview of the exact string that will be saved */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.t }}>
                            <Clock size={13} color={C.p} />
                            {is24 ? "Open 24 Hours" : rangeString(s)}
                        </div>

                        <button
                            type="button"
                            onClick={() => update({ mode: "custom", custom: is24 ? "Open 24 Hours" : rangeString(s) })}
                            style={{ ...linkBtn, color: C.tm, fontSize: 11 }}
                        >
                            <Pencil size={11} /> Enter custom text
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default WorkingHoursPicker
