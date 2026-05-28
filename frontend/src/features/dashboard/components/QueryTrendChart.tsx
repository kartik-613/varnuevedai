import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface QueryTrendChartProps {
  data: Array<{ id: string; month: string; queries: number }>;
}

export function QueryTrendChart({ data }: QueryTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
        <Line
          type="monotone"
          dataKey="queries"
          stroke="#0F766E"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
