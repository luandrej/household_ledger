"use client";

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { formatZAR, monthShortLabel } from "@/lib/format";

export default function SavingsGrowthChart({
  history,
}: {
  history: { goalId: string; balance: number; month: number; year: number }[];
}) {
  const byMonth = new Map<string, number>();
  for (const h of history) {
    const key = `${h.year}-${h.month}`;
    byMonth.set(key, (byMonth.get(key) || 0) + h.balance);
  }

  const points = Array.from(byMonth.entries())
    .map(([key, total]) => {
      const [year, month] = key.split("-").map(Number);
      return { year, month, total };
    })
    .sort((a, b) => (a.year - b.year) || (a.month - b.month))
    .map((p) => ({ label: monthShortLabel(p.month, p.year), total: p.total }));

  if (points.length < 2) {
    return (
      <div>
        <p className="text-xs text-[var(--ink-soft)] mb-3">Total savings growth</p>
        <p className="text-sm text-[var(--ink-soft)] italic">
          Update a goal&apos;s balance across a couple of months to see the growth trend here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-[var(--ink-soft)] mb-3">Total savings growth</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={points} margin={{ left: -10, right: 20, top: 10 }}>
          <CartesianGrid stroke="#d9ddd0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#1f3a2e" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#1f3a2e" }} axisLine={false} tickLine={false} width={70} />
          <Tooltip
            formatter={(value) => formatZAR(Number(value))}
            contentStyle={{ background: "var(--paper)", border: "1px solid var(--paper-line)", fontSize: 13 }}
          />
          <Line type="monotone" dataKey="total" stroke="#2f6f5e" strokeWidth={2} dot={{ r: 3, fill: "#2f6f5e" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
