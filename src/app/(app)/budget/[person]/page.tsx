import { notFound } from "next/navigation";
import { currentMonthYear, formatZAR } from "@/lib/format";
import * as data from "@/lib/data";
import MonthSelector from "@/components/MonthSelector";
import SummaryRow from "@/components/SummaryRow";
import { addIncomeAction, addExpenseAction, deleteIncomeAction, deleteExpenseAction } from "../../actions";
import type { Person } from "@/lib/auth";

const PERSON_MAP: Record<string, Person> = { lu: "LU", wife: "WIFE" };

export default async function PersonBudgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ person: string }>;
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const { person: personSlug } = await params;
  const person = PERSON_MAP[personSlug];
  if (!person) notFound();

  const sp = await searchParams;
  const defaults = currentMonthYear();
  const month = sp.month ? Number(sp.month) : defaults.month;
  const year = sp.year ? Number(sp.year) : defaults.year;

  const wifeDisplayName = process.env.WIFE_DISPLAY_NAME || "Wife";
  const displayName = person === "LU" ? "Lu" : wifeDisplayName;

  const income = data.listIncome(month, year).filter((i) => i.person === person);
  const expenses = data.listExpenses(month, year).filter((e) => e.person === person);

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpenses;
  const percentSpent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-xl">{displayName}&apos;s budget</h2>
        <MonthSelector month={month} year={year} />
      </div>

      <SummaryRow
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
        percentSpent={percentSpent}
      />

      <div className="grid md:grid-cols-2 gap-12">
        <section>
          <h3 className="font-display text-lg mb-4">Income</h3>
          <ul className="mb-4">
            {income.map((i) => (
              <li
                key={i.id}
                className="flex justify-between items-center py-2 ledger-rule text-sm"
              >
                <span>{i.name}</span>
                <span className="flex items-center gap-3">
                  <span className="tabular">{formatZAR(i.amount)}</span>
                  <form action={deleteIncomeAction}>
                    <input type="hidden" name="id" value={i.id} />
                    <DeleteButton />
                  </form>
                </span>
              </li>
            ))}
            {income.length === 0 && (
              <li className="py-2 text-sm text-[var(--ink-soft)] italic">No income entries yet.</li>
            )}
          </ul>
          <form action={addIncomeAction} className="flex gap-2 items-end">
            <input type="hidden" name="person" value={person} />
            <input type="hidden" name="month" value={month} />
            <input type="hidden" name="year" value={year} />
            <div className="flex-1">
              <label className="block text-xs text-[var(--ink-soft)] mb-1">Name</label>
              <input name="name" required className="w-full border-b border-[var(--paper-line)] bg-transparent py-1.5 text-sm outline-none focus:border-[var(--ink)]" />
            </div>
            <div className="w-28">
              <label className="block text-xs text-[var(--ink-soft)] mb-1">Amount</label>
              <input name="amount" type="number" step="0.01" required className="w-full border-b border-[var(--paper-line)] bg-transparent py-1.5 text-sm outline-none focus:border-[var(--ink)]" />
            </div>
            <AddButton />
          </form>
        </section>

        <section>
          <h3 className="font-display text-lg mb-4">Expenses</h3>
          <ul className="mb-4">
            {expenses.map((e) => (
              <li
                key={e.id}
                className="flex justify-between items-center py-2 ledger-rule text-sm"
              >
                <span>
                  {e.name}
                  {e.category && <span className="text-[var(--ink-soft)]"> · {e.category}</span>}
                </span>
                <span className="flex items-center gap-3">
                  <span className="tabular">{formatZAR(e.amount)}</span>
                  <form action={deleteExpenseAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <DeleteButton />
                  </form>
                </span>
              </li>
            ))}
            {expenses.length === 0 && (
              <li className="py-2 text-sm text-[var(--ink-soft)] italic">No expenses recorded yet.</li>
            )}
          </ul>
          <form action={addExpenseAction} className="space-y-2">
            <input type="hidden" name="person" value={person} />
            <input type="hidden" name="month" value={month} />
            <input type="hidden" name="year" value={year} />
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-[var(--ink-soft)] mb-1">Name</label>
                <input name="name" required className="w-full border-b border-[var(--paper-line)] bg-transparent py-1.5 text-sm outline-none focus:border-[var(--ink)]" />
              </div>
              <div className="w-28">
                <label className="block text-xs text-[var(--ink-soft)] mb-1">Amount</label>
                <input name="amount" type="number" step="0.01" required className="w-full border-b border-[var(--paper-line)] bg-transparent py-1.5 text-sm outline-none focus:border-[var(--ink)]" />
              </div>
            </div>
            <div className="flex gap-2 items-end justify-between">
              <div className="flex-1">
                <label className="block text-xs text-[var(--ink-soft)] mb-1">Category (optional)</label>
                <input name="category" className="w-full border-b border-[var(--paper-line)] bg-transparent py-1.5 text-sm outline-none focus:border-[var(--ink)]" />
              </div>
              <label className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)] whitespace-nowrap pb-2">
                <input type="checkbox" name="recurring" defaultChecked />
                Repeats monthly
              </label>
              <AddButton />
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

function AddButton() {
  return (
    <button
      type="submit"
      className="text-sm px-4 py-1.5 border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors whitespace-nowrap"
    >
      Add
    </button>
  );
}

function DeleteButton() {
  return (
    <button
      type="submit"
      aria-label="Delete"
      className="text-[var(--ink-soft)] hover:text-[var(--rust)] transition-colors"
    >
      ×
    </button>
  );
}
