"use client";

/**
 * src/components/features/dashboard/FindingsBarChart.tsx
 *
 * Findings counted by a nominal dimension (platform, category). Magnitude
 * comparison across independent categories, identity already carried by the
 * axis label -> one hue for every bar (sequential is the safe default per the
 * dataviz skill), bars render in the order given.
 */

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  data: { label: string; count: number }[];
};

type TooltipPayloadItem = { value: number; payload: { label: string } };

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) => {
  if (!active || !payload?.length) return null;
  const { value, payload: data } = payload[0];
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{data.label}</p>
      <p className="text-muted-foreground">
        Findings: <span className="font-medium text-foreground">{value}</span>
      </p>
    </div>
  );
};

export function FindingsBarChart({ data }: Props) {
  if (data.every((d) => d.count === 0)) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground italic">
        No findings data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="#e6dfd8" />
        <XAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#6c6a64", fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: "#e6dfd8" }}
          tick={{ fill: "#141413", fontSize: 12 }}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#efe9de" }} />
        <Bar dataKey="count" fill="#5db8a6" radius={[0, 4, 4, 0]} maxBarSize={24}>
          <LabelList dataKey="count" position="right" style={{ fill: "#6c6a64", fontSize: 11 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
