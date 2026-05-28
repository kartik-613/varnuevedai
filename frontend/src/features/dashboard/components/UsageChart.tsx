import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface UsageChartProps {
  data: Array<{ id: string; month: string; usage: number }>;
}

export function UsageChart({ data }: UsageChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 12 }} />
        <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            fontSize: "12px"
          }}
        />
        <Area
          type="monotone"
          dataKey="usage"
          stroke="#14B8A6"
          fill="#CCFBF1"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
