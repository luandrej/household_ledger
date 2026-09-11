"use client";

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { formatZAR } from "@/lib/format";

export default function TrendChart({
  data,
}: {
  data: { label: string; balance: number }[];
}) {
  return (
    <div>
      <p className="text-xs text-[var(--ink-soft)] mb-3">Balance over recent months</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ left: -10, right: 20, top: 10 }}>
          <CartesianGrid stroke="#d9ddd0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#1f3a2e" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#1f3a2e" }} axisLine={false} tickLine={false} width={70} />
          <Tooltip
            formatter={(value) => formatZAR(Number(value))}
            contentStyle={{
              background: "var(--paper)",
              border: "1px solid var(--paper-line)",
              fontSize: 13,
            }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#b8862f"
            strokeWidth={2}
            dot={{ r: 3, fill: "#b8862f" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
