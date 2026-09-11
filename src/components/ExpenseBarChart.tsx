"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { formatZAR } from "@/lib/format";

const PERSON_COLOR: Record<string, string> = {
  LU: "#2f6f5e",
  WIFE: "#8a5a44",
  SHARED: "#4b5d54",
};

export default function ExpenseBarChart({
  items,
}: {
  items: { name: string; amount: number; person: string }[];
}) {
  const sorted = [...items].sort((a, b) => b.amount - a.amount).slice(0, 12);

  if (sorted.length === 0) {
    return (
      <div>
        <p className="text-xs text-[var(--ink-soft)] mb-3">Expenses, largest first</p>
        <p className="text-sm text-[var(--ink-soft)] italic">No expenses recorded yet.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-[var(--ink-soft)] mb-3">Expenses, largest first</p>
      <ResponsiveContainer width="100%" height={Math.max(220, sorted.length * 32)}>
        <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 12, fill: "#1f3a2e" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => formatZAR(Number(value))}
            contentStyle={{
              background: "var(--paper)",
              border: "1px solid var(--paper-line)",
              fontSize: 13,
            }}
          />
          <Bar dataKey="amount" radius={0} barSize={14}>
            {sorted.map((entry, i) => (
              <Cell key={i} fill={PERSON_COLOR[entry.person] || "#4b5d54"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
