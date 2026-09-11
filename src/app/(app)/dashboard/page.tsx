import { currentMonthYear, monthShortLabel } from "@/lib/format";
import * as data from "@/lib/data";
import MonthSelector from "@/components/MonthSelector";
import SummaryRow from "@/components/SummaryRow";
import IncomeExpenseDonut from "@/components/IncomeExpenseDonut";
import ExpenseBarChart from "@/components/ExpenseBarChart";
import TrendChart from "@/components/TrendChart";
import { duplicateMonthAction } from "../actions";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const defaults = currentMonthYear();
  const month = params.month ? Number(params.month) : defaults.month;
  const year = params.year ? Number(params.year) : defaults.year;

  const totals = data.monthTotals(month, year);
  const expenses = data.listExpenses(month, year);

  const trailing = data.trailingMonths(6, month, year);
  const trend = trailing.map((m) => {
    const t = data.monthTotals(m.month, m.year);
    return { label: monthShortLabel(m.month, m.year), balance: t.balance };
  });

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const hasEntriesThisMonth = expenses.length > 0 || data.listIncome(month, year).length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-xl">Household summary</h2>
        <MonthSelector month={month} year={year} />
      </div>

      <SummaryRow
        totalIncome={totals.totalIncome}
        totalExpenses={totals.totalExpenses}
        balance={totals.balance}
        percentSpent={totals.percentSpent}
      />

      {!hasEntriesThisMonth && (
        <form
          action={duplicateMonthAction}
          className="mb-10 p-4 border border-dashed border-[var(--paper-line)] flex items-center justify-between"
        >
          <p className="text-sm text-[var(--ink-soft)]">
            No entries yet for this month. Copy last month&apos;s recurring items to get started.
          </p>
          <input type="hidden" name="fromMonth" value={prevMonth} />
          <input type="hidden" name="fromYear" value={prevYear} />
          <input type="hidden" name="toMonth" value={month} />
          <input type="hidden" name="toYear" value={year} />
          <button
            type="submit"
            className="text-sm px-4 py-2 border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors whitespace-nowrap ml-4"
          >
            Copy last month
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-10 mb-10">
        <IncomeExpenseDonut totalIncome={totals.totalIncome} totalExpenses={totals.totalExpenses} />
        <ExpenseBarChart items={expenses} />
      </div>

      <TrendChart data={trend} />
    </div>
  );
}
