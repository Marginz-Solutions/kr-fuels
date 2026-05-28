import { C } from "@/constants/colors";

export function StationListSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 12px 9px 14px',
            borderLeft: '3px solid transparent',
            borderBottom: `1px solid ${C.bd}`,
          }}
        >
          <div
            className="sk"
            style={{
              height: 13,
              width: `${[55, 70, 45, 62, 50, 68, 40][i % 7]}%`,
              borderRadius: 3,
            }}
          />
          <div
            className="sk"
            style={{
              height: 18,
              width: 28,
              borderRadius: 10,
              flexShrink: 0,
              marginLeft: 6,
            }}
          />
        </div>
      ))}
    </div>
  )
}