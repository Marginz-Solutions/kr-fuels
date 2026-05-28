"use client"

import { card } from "@/styles/shared"

const shimmer: React.CSSProperties = {
  background: "linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,0.06) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: 6,
}

const bar = (w: string | number, h = 12, extra?: React.CSSProperties): React.CSSProperties => ({
  ...shimmer,
  width: w,
  height: h,
  borderRadius: 6,
  flexShrink: 0,
  ...extra,
})

const divider: React.CSSProperties = {
  height: "0.5px",
  background: "rgba(0,0,0,0.07)",
  margin: "4px 0 16px",
}

const sectionLabelSkeleton: React.CSSProperties = {
  ...shimmer,
  width: 64,
  height: 10,
  borderRadius: 4,
  marginBottom: 10,
}

const fieldSkeleton = (labelW: string | number = 80) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={bar(labelW, 10)} />
    <div style={{ ...shimmer, height: 34, borderRadius: 8, width: "100%" }} />
  </div>
)

const cardHeader = (iconBg: string) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "16px 20px", borderBottom: "0.5px solid rgba(0,0,0,0.08)",
  }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, flexShrink: 0 }} />
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={bar(120, 12)} />
      <div style={bar(180, 10)} />
    </div>
  </div>
)

const footerSkeleton = (
  <div style={{
    padding: "14px 20px",
    borderTop: "0.5px solid rgba(0,0,0,0.08)",
    background: "rgba(0,0,0,0.02)",
  }}>
    <div style={{ ...shimmer, width: 120, height: 34, borderRadius: 8 }} />
  </div>
)

export function EssentialsCardLoading() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ ...card(), overflow: "hidden", padding: 0 }}>
        {cardHeader("rgba(21,101,192,0.08)")}

        <div style={{ padding: "20px 20px 0" }}>
          {/* Identity */}
          <div style={sectionLabelSkeleton} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
            {fieldSkeleton(100)}
            {fieldSkeleton(60)}
          </div>

          <div style={divider} />

          {/* Emails */}
          <div style={sectionLabelSkeleton} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
            {fieldSkeleton(70)}
            {fieldSkeleton(90)}
          </div>

          <div style={divider} />

          {/* Phone numbers */}
          <div style={sectionLabelSkeleton} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {fieldSkeleton(80)}
            {fieldSkeleton(70)}
          </div>
        </div>

        {footerSkeleton}
      </div>
    </>
  )
}

export function PresentsCardLoading() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Address card skeleton */}
        <div style={{ ...card(), overflow: "hidden", padding: 0 }}>
          {cardHeader("rgba(15,110,86,0.08)")}

          <div style={{ padding: "20px 20px 0" }}>
            {/* Location section */}
            <div style={sectionLabelSkeleton} />
            <div style={{ marginBottom: 10 }}>
              {fieldSkeleton("100%")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 10 }}>
              {fieldSkeleton(50)}
              {fieldSkeleton(40)}
              {fieldSkeleton(55)}
            </div>

            <div style={divider} />

            {/* Coordinates section */}
            <div style={sectionLabelSkeleton} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {fieldSkeleton(55)}
              {fieldSkeleton(65)}
            </div>
          </div>

          {/* Empty footer placeholder matching real card */}
          <div style={{
            padding: "14px 20px",
            borderTop: "0.5px solid rgba(0,0,0,0.08)",
            background: "rgba(0,0,0,0.02)",
            minHeight: 20,
          }} />
        </div>

        {/* Social links card skeleton */}
        <div style={{ ...card(), overflow: "hidden", padding: 0 }}>
          {cardHeader("rgba(186,117,23,0.08)")}

          <div style={{ padding: "12px 20px" }}>
            {(["Facebook", "Instagram", "Twitter / X", "YouTube"] as const).map((_, i, arr) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 0",
                borderBottom: i < arr.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, ...shimmer, flexShrink: 0 }} />
                <div style={{ ...shimmer, width: 60, height: 10, borderRadius: 4, flexShrink: 0 }} />
                <div style={{ ...shimmer, flex: 1, height: 30, borderRadius: 8 }} />
              </div>
            ))}
          </div>

          {footerSkeleton}
        </div>
      </div>
    </>
  )
}