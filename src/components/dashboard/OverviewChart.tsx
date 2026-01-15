'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  {
    name: "Seg",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Ter",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Qua",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Qui",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Sex",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Sab",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Dom",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
];

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#2563eb" // blue-600
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
