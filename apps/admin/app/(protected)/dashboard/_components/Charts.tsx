"use client";
// Recharts is heavy (~hundreds of KB). It lives here, in its own module, so the
// dashboard can pull it in via next/dynamic (ssr:false) — keeping it out of the
// initial dashboard bundle and off the critical render/hydration path.
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Label,
} from "recharts";
import { C } from "@/constants/colors";

const TOOLTIP_STYLE = {
  backgroundColor: C.bgGlass,
  backdropFilter: "blur(3px)",
  border: `1px solid #FFFFFF0D`,
  borderRadius: 8,
  fontSize: 11,
  color: "#868988",
  textTransform: "capitalize",
  zIndex: 20,
} as const;

export function FeedbackBarChart({
  data,
}: {
  data: Array<{ name: string; count: number; fill: string }>;
}) {
  return (
    // minWidth/minHeight give a valid first measurement before the ResizeObserver
    // fires — otherwise recharts logs a width(-1)/height(-1) warning on mount
    // (the chart is loaded via next/dynamic ssr:false, ahead of layout).
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
      <BarChart layout="vertical" data={data} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.bd} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: C.tm }} axisLine={false} tickLine={false} />
        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: C.tm }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: C.pXLight }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FeedbackStatusDonut({
  data,
  total,
}: {
  data: Array<{ name: string; value: number; fill: string }>;
  total: number;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
      <PieChart responsive>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={75}
          paddingAngle={3}
          cornerRadius="5%"
          dataKey="value"
        >
          <Label
            position="left"
            content={({ viewBox }) => {
              const { cx, cy } = (viewBox || {}) as any;
              return (
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                  <tspan x={cx} dy="-5" className="text-[22px] font-bold fill-ink">
                    {total}
                  </tspan>
                  <tspan x={cx} dy="18" className="text-[10px] uppercase tracking-wider fill-mutedfg font-semibold">
                    Feedbacks
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: C.pXLight }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
