import { C } from '@/constants/colors'
import { card } from '@/styles/shared'

// ── Pulse shimmer keyframe ─────────────────────────────────────────────────
export const shimmerStyle = `
@keyframes shimmer {
  0%   { background-position: -600px 0 }
  100% { background-position:  600px 0 }
}
.faq-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s ease infinite;
          border-radius: 6px;
}
`

// ── Reusable shimmer block ─────────────────────────────────────────────────
const Shimmer = ({ w = "100%", h = 14, style = {} }: { w?: string | number; h?: number; style?: React.CSSProperties }) => (
  <div
    className="faq-shimmer"
    style={{ width: w, height: h, borderRadius: 6, flexShrink: 0, ...style }}
  />
)

// ── Single accordion skeleton row ─────────────────────────────────────────
export const AccordionSkeleton = ({ wide }: { wide?: boolean }) => (
  <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 12 }}>
      {/* Question text */}
      <div style={{ flex: 1 }}>
        <Shimmer w={wide ? "72%" : "55%"} h={14} />
      </div>
      {/* Action icon placeholders */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Shimmer w={28} h={28} style={{ borderRadius: 8 }} />
        <Shimmer w={28} h={28} style={{ borderRadius: 8 }} />
        <Shimmer w={16} h={16} style={{ borderRadius: 4 }} />
      </div>
    </div>
  </div>
)

// ── Main export ───────────────────────────────────────────────────────────
const Loading = () => (
  <div style={{ padding: 24 }}>
    <style>{shimmerStyle}</style>

    {/* Header */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Shimmer w={220} h={16} />
        <Shimmer w={80} h={12} />
      </div>
      <Shimmer w={110} h={36} style={{ borderRadius: 10 }} />
    </div>

    {/* Toolbar */}
    <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
      {/* Search bar */}
      <div style={{
        flex: 1, minWidth: 200,
        border: `1px solid ${C.bd}`,
        borderRadius: 10,
        padding: "9px 12px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: C.white,
      }}>
        <Shimmer w={14} h={14} style={{ borderRadius: "50%", flexShrink: 0 }} />
        <Shimmer w="60%" h={13} />
      </div>

      {/* Limit selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Shimmer w={34} h={12} />
        <Shimmer w={70} h={36} style={{ borderRadius: 10 }} />
        <Shimmer w={52} h={12} />
      </div>
    </div>

    {/* Accordion rows — vary widths so it feels organic */}
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
      <AccordionSkeleton wide />
      <AccordionSkeleton />
      <AccordionSkeleton wide />
      <AccordionSkeleton />
      <AccordionSkeleton wide />
      <AccordionSkeleton />
      <AccordionSkeleton wide />
    </div>

    {/* Pagination */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
      <Shimmer w={90} h={12} />
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4].map((k) => (
          <Shimmer key={k} w={32} h={32} style={{ borderRadius: 8 }} />
        ))}
      </div>
    </div>
  </div>
)

export default Loading