"use client";

/**
 * src/components/features/dashboard/RampBarChart.tsx
 *
 * Column chart for an ordinal scale (severity Low -> Critical, status
 * Proposed -> Completed). Bars step along the shared coral ramp in @/lib/tones,
 * the same colors the badges use, so a level looks the same everywhere.
 * Pass data in scale order; bar i takes ramp step i.
 */

import { ORDINAL_RAMP } from "@/lib/tones";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
        Count: <span className="font-medium text-foreground">{value}</span>
      </p>
    </div>
  );
};

export function RampBarChart({ data }: Props) {
  if (data.every((d) => d.count === 0)) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground italic">
        No data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e6dfd8" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: "#e6dfd8" }}
          tick={{ fill: "#6c6a64", fontSize: 11 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#6c6a64", fontSize: 11 }}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#efe9de" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((entry, i) => (
            <Cell key={entry.label} fill={ORDINAL_RAMP[Math.min(i, ORDINAL_RAMP.length - 1)]} />
          ))}
          <LabelList dataKey="count" position="top" style={{ fill: "#6c6a64", fontSize: 11 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
