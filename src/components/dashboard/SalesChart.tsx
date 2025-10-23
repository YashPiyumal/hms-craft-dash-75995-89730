import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { date: "Jan 1", sales: 400 },
  { date: "Jan 5", sales: 300 },
  { date: "Jan 10", sales: 600 },
  { date: "Jan 15", sales: 800 },
  { date: "Jan 20", sales: 500 },
  { date: "Jan 25", sales: 900 },
  { date: "Jan 30", sales: 700 },
];

export const SalesChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Area
          type="monotone"
          dataKey="sales"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorSales)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
