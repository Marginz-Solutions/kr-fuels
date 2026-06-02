import { C } from '@/constants/colors'
import { card } from '@/styles/shared'

const shimmerStyle = `
@keyframes shimmer {
  0%   { background-position: -600px 0 }
  100% { background-position:  600px 0 }
}
.st-shimmer {
  background: linear-gradient(90deg, ${C.bd} 25%, #e9eef0 50%, ${C.bd} 75%);
  background-size: 600px 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: 6px;
}
`

const Shimmer = ({ w = "100%", h = 14, style = {} }: { w?: string | number; h?: number; style?: React.CSSProperties }) => (
    <div className="st-shimmer" style={{ width: w, height: h, borderRadius: 6, flexShrink: 0, ...style }} />
)

// ── KPI card skeleton ─────────────────────────────────────────────────────
const StatCardSkeleton = () => (
    <div style={{ ...card(), display: "flex", flexDirection: "column", gap: 10, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent:"space-between" }}>
            <Shimmer w="55%" h={12} />
            <Shimmer w={32} h={32} style={{ borderRadius: 8 }} />
        </div>
        <Shimmer w="40%" h={24} />
        <Shimmer w="65%" h={11} />
    </div>
)

// ── Table row skeleton ────────────────────────────────────────────────────
const TableRowSkeleton = ({ i }: { i: number }) => (
    <tr style={{ borderTop: `1px solid ${C.bd}`, background: i % 2 === 0 ? C.white : "#fafcfb" }}>
        <td style={{ padding: "12px 16px" }}><Shimmer w="80%" h={13} /></td>
        <td style={{ padding: "12px 16px" }}><Shimmer w={72} h={22} style={{ borderRadius: 20 }} /></td>
        <td style={{ padding: "12px 16px", maxWidth: 200 }}><Shimmer w="90%" h={12} /></td>
        <td style={{ padding: "12px 16px" }}><Shimmer w={100} h={12} /></td>
        <td style={{ padding: "12px 16px" }}><Shimmer w={90} h={12} /></td>
        <td style={{ padding: "12px 16px" }}><Shimmer w={56} h={22} style={{ borderRadius: 20 }} /></td>
        <td style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", gap: 6 }}>
                <Shimmer w={28} h={28} style={{ borderRadius: 8 }} />
                <Shimmer w={28} h={28} style={{ borderRadius: 8 }} />
            </div>
        </td>
    </tr>
)

// ── Main export ───────────────────────────────────────────────────────────
const Loading = () => (
    <div style={{ padding: 24 }}>
        <style>{shimmerStyle}</style>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
            {[0, 1, 2, 3].map((k) => <StatCardSkeleton key={k} />)}
        </div>

        {/* Table card */}
        <div style={{ ...card(), padding: 0, overflow: "hidden" }}>

            {/* Toolbar */}
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {/* <div style={{
                    flex: 1, minWidth: 200,
                    display: "flex", alignItems: "center", gap: 8,
                    background: C.bg, borderRadius: 10, padding: "7px 12px",
                }}>
                    <Shimmer w={14} h={14} style={{ borderRadius: "50%", flexShrink: 0 }} />
                    <Shimmer w="50%" h={13} />
                </div> */}
                <Shimmer w={140} h={36} style={{ borderRadius: 10 }} />
                <div style={{ display: "flex", gap: 4 }}>
                    <Shimmer w={34} h={34} style={{ borderRadius: 8 }} />
                    <Shimmer w={34} h={34} style={{ borderRadius: 8 }} />
                </div>
                <Shimmer w={120} h={36} style={{ borderRadius: 10 }} />
            </div>

            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: C.bg }}>
                        {["Station Name", "District", "Address", "Phone", "Hours", "Status", "Actions"].map((h) => (
                            <th key={h} style={{ padding: "10px 16px", textAlign: "left" }}>
                                <Shimmer w={h === "Actions" ? 50 : "70%"} h={11} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 7 }, (_, i) => <TableRowSkeleton key={i} i={i} />)}
                </tbody>
            </table>
        </div>
    </div>
)

export default Loading