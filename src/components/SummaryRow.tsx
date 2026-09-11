import { formatZAR } from "@/lib/format";

export default function SummaryRow({
  totalIncome,
  totalExpenses,
  balance,
  percentSpent,
}: {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  percentSpent: number;
}) {
  const overspent = balance < 0;
  const clampedPercent = Math.min(percentSpent, 100);

  return (
    <div className="mb-10">
      <div className="grid grid-cols-3 ledger-rule-thick border-b border-[var(--paper-line)]">
        <SummaryCell label="Income" value={totalIncome} />
        <SummaryCell label="Expenses" value={totalExpenses} />
        <SummaryCell
          label="Balance"
          value={balance}
          accent={overspent ? "var(--rust)" : "var(--lu-mark)"}
        />
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm text-[var(--ink-soft)] mb-2">
          <span>Percentage of income spent</span>
          <span className="tabular">{percentSpent.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-[var(--paper-line)]">
          <div
            className="h-2 transition-all"
            style={{
              width: `${clampedPercent}%`,
              background: percentSpent > 100 ? "var(--rust)" : "var(--brass)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="py-4 px-1">
      <p className="text-xs text-[var(--ink-soft)] mb-1">{label}</p>
      <p
        className="font-display text-2xl tabular"
        style={accent ? { color: accent } : undefined}
      >
        {formatZAR(value)}
      </p>
    </div>
  );
}
