// components/ui/TableSkeleton.tsx
import { C } from "@/constants/colors"
import { card } from "@/styles/shared"

interface TableSkeletonProps {
  rows?:    number
  columns?: number
}

const TableSkeleton = ({ rows = 6, columns = 6 }: TableSkeletonProps) => (
  <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
    <style>{`
      @keyframes shimmer {
        0%   { background-position: -600px 0 }
        100% { background-position:  600px 0 }
      }
      .sk {
        background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
        background-size: 600px 100%;
        animation: shimmer 1.4s ease infinite;
        border-radius: 6px;
      }
    `}</style>

    {/* Header bar */}
    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div className="sk" style={{ height: 16, width: 200 }} />
      <div className="sk" style={{ height: 30, width: 36, borderRadius: 8 }} />
    </div>

    {/* Table head */}
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: C.bg }}>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} style={{ padding: "10px 16px" }}>
              <div className="sk" style={{ height: 11, width: i === 0 ? 60 : i === columns - 1 ? 50 : 80 }} />
            </th>
          ))}
        </tr>
      </thead>

      {/* Table rows */}
      <tbody>
        {Array.from({ length: rows }).map((_, ri) => (
          <tr
            key={ri}
            style={{
              borderTop:  `1px solid ${C.bd}`,
              background: ri % 2 === 0 ? C.white : "#fafcfb",
            }}
          >
            {Array.from({ length: columns }).map((_, ci) => (
              <td key={ci} style={{ padding: "12px 16px" }}>
                <div
                  className="sk"
                  style={{
                    height: 13,
                    // vary widths so it looks organic
                    width: ci === 0 ? "70%"
                         : ci === columns - 1 ? "60%"
                         : ci % 2 === 0 ? "80%"
                         : "55%",
                    // stagger animation delay per row
                    animationDelay: `${ri * 0.07}s`,
                  }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>

    {/* Pagination row */}
    <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.bd}`, display: "flex", justifyContent: "flex-end", gap: 6, alignItems: "center" }}>
      <div className="sk" style={{ height: 13, width: 80, marginRight: 8 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="sk" style={{ height: 28, width: 32, borderRadius: 8 }} />
      ))}
    </div>
  </div>
)

export default TableSkeleton