import type { FC, ReactNode } from "react";
import { card } from "../../styles/shared";
import { C } from "../../constants/colors";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

const StatCard: FC<StatCardProps> = ({ icon, label, value, sub, color = C.p }) => (
  <div style={{ ...card(), padding: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 13, color: C.tm, marginBottom: 6, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: C.t, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: C.tm, marginTop: 4 }}>{sub}</div>}
      </div>
      <div
        style={{
          width:          44,
          height:         44,
          borderRadius:   12,
          background:     C.pXLight,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          color,
        }}
      >
        {icon}
      </div>
    </div>
  </div>
);

export default StatCard;
