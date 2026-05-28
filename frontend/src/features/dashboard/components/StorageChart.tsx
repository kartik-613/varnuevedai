import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface StorageChartProps {
  data: Array<{ id: string; org: string; storage: number }>;
}

export function StorageChart({ data }: StorageChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="org" tick={{ fill: "#6B7280", fontSize: 12 }} />
        <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            fontSize: "12px"
          }}
        />
        <Bar dataKey="storage" fill="#0D9488" />
      </BarChart>
    </ResponsiveContainer>
  );
}
