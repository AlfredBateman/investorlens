"use client";

/**
 * src/components/features/dashboard/FindingsTrendChart.tsx
 *
 * Findings discovered per week, bucketed by the linked interview's date (not
 * the finding's own createdAt, which only reflects when it was logged in the
 * app). Single series -> one hue, no legend box per the dataviz skill: the
 * card's own title already says what's plotted. Only the last point is
 * direct-labeled; the rest live in the axis and tooltip.
 */

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  data: { week: string; count: number }[];
};

type TooltipPayloadItem = { value: number; payload: { week: string } };

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) => {
  if (!active || !payload?.length) return null;
  const { value, payload: data } = payload[0];
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">Week of {data.week}</p>
      <p className="text-muted-foreground">
        Findings: <span className="font-medium text-foreground">{value}</span>
      </p>
    </div>
  );
};

type LabelProps = { x?: string | number; y?: string | number; index?: number };

function EndLabel({ x, y, index, data }: LabelProps & { data: Props["data"] }) {
  if (x == null || y == null || index == null || index !== data.length - 1) return null;
  return (
    <text x={x} y={Number(y) - 10} textAnchor="middle" className="fill-foreground text-[11px] font-medium">
      {data[index].count}
    </text>
  );
}

export function FindingsTrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground italic">
        No dated findings yet — link a finding to an interview to see the trend.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e6dfd8" />
        <XAxis
          dataKey="week"
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
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e6dfd8" }} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#cc785c"
          strokeWidth={2}
          dot={{ r: 4, fill: "#cc785c", strokeWidth: 2, stroke: "#faf9f5" }}
          activeDot={{ r: 5 }}
          label={(props) => <EndLabel {...props} data={data} />}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
