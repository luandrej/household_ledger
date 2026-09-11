"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatZAR } from "@/lib/format";

export default function IncomeExpenseDonut({
  totalIncome,
  totalExpenses,
}: {
  totalIncome: number;
  totalExpenses: number;
}) {
  const data = [
    { name: "Income", value: totalIncome, color: "#2f6f5e" },
    { name: "Expenses", value: totalExpenses, color: "#b8862f" },
  ];

  return (
    <div>
      <p className="text-xs text-[var(--ink-soft)] mb-3">Income vs. expenses</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatZAR(Number(value))}
            contentStyle={{
              background: "var(--paper)",
              border: "1px solid var(--paper-line)",
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-6 justify-center text-sm mt-1">
        <Legend swatch="#2f6f5e" label="Income" />
        <Legend swatch="#b8862f" label="Expenses" />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-[var(--ink-soft)]">
      <span className="w-2.5 h-2.5 inline-block" style={{ background: swatch }} />
      {label}
    </span>
  );
}
