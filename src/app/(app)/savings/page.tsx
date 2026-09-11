import * as data from "@/lib/data";
import { formatZAR } from "@/lib/format";
import {
  addSavingsGoalAction,
  updateSavingsBalanceAction,
  deleteSavingsGoalAction,
} from "../actions";
import SavingsGrowthChart from "@/components/SavingsGrowthChart";

export default async function SavingsPage() {
  const goals = data.listSavingsGoals();
  const history = data.listSavingsHistory();

  const totalBalance = goals.reduce((s, g) => s + g.currentBalance, 0);
  const totalMonthly = goals.reduce((s, g) => s + g.monthlyContribution, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="font-display text-xl">Savings & investments</h2>
        <div className="text-right">
          <p className="text-xs text-[var(--ink-soft)]">Total across all goals</p>
          <p className="font-display text-2xl tabular">{formatZAR(totalBalance)}</p>
        </div>
      </div>

      <p className="text-sm text-[var(--ink-soft)] mb-8">
        Putting <span className="tabular font-medium text-[var(--ink)]">{formatZAR(totalMonthly)}</span> toward savings and investments each month.
      </p>

      <div className="space-y-6 mb-12">
        {goals.map((goal) => {
          const percent = goal.targetAmount
            ? Math.min((goal.currentBalance / goal.targetAmount) * 100, 100)
            : null;
          return (
            <div key={goal.id} className="ledger-rule pt-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-display text-lg">{goal.name}</p>
                  <p className="text-xs text-[var(--ink-soft)]">
                    {formatZAR(goal.monthlyContribution)} / month
                    {goal.targetDate ? ` · target ${goal.targetDate}` : ""}
                  </p>
                </div>
                <form action={deleteSavingsGoalAction}>
                  <input type="hidden" name="id" value={goal.id} />
                  <button
                    type="submit"
                    className="text-xs text-[var(--ink-soft)] hover:text-[var(--rust)] transition-colors"
                  >
                    Remove
                  </button>
                </form>
              </div>

              {percent !== null && (
                <div className="mb-2">
                  <div className="h-2 bg-[var(--paper-line)]">
                    <div
                      className="h-2 bg-[var(--brass)] transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[var(--ink-soft)] mt-1">
                    <span className="tabular">{formatZAR(goal.currentBalance)}</span>
                    <span className="tabular">of {formatZAR(goal.targetAmount!)}</span>
                  </div>
                </div>
              )}
              {percent === null && (
                <p className="tabular text-sm mb-2">{formatZAR(goal.currentBalance)}</p>
              )}

              <form action={updateSavingsBalanceAction} className="flex gap-2 items-end mt-2">
                <input type="hidden" name="id" value={goal.id} />
                <div className="w-40">
                  <label className="block text-xs text-[var(--ink-soft)] mb-1">
                    Update current balance
                  </label>
                  <input
                    name="currentBalance"
                    type="number"
                    step="0.01"
                    defaultValue={goal.currentBalance}
                    className="w-full border-b border-[var(--paper-line)] bg-transparent py-1.5 text-sm outline-none focus:border-[var(--ink)]"
                  />
                </div>
                <button
                  type="submit"
                  className="text-sm px-4 py-1.5 border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
                >
                  Update
                </button>
              </form>
            </div>
          );
        })}
        {goals.length === 0 && (
          <p className="text-sm text-[var(--ink-soft)] italic">No savings or investment goals yet.</p>
        )}
      </div>

      <details className="mb-12">
        <summary className="cursor-pointer text-sm font-medium mb-4">Add a new goal</summary>
        <form action={addSavingsGoalAction} className="grid md:grid-cols-2 gap-4 mt-4 max-w-xl">
          <div>
            <label className="block text-xs text-[var(--ink-soft)] mb-1">Name</label>
            <input name="name" required className="w-full border-b border-[var(--paper-line)] bg-transparent py-1.5 text-sm outline-none focus:border-[var(--ink)]" />
          </div>
          <div>
            <label className="block text-xs text-[var(--ink-soft)] mb-1">Target amount (optional)</label>
            <input name="targetAmount" type="number" step="0.01" className="w-full border-b border-[var(--paper-line)] bg-transparent py-1.5 text-sm outline-none focus:border-[var(--ink)]" />
          </div>
          <div>
            <label className="block text-xs text-[var(--ink-soft)] mb-1">Target date (optional)</label>
            <input name="targetDate" type="text" placeholder="e.g. Dec 2027" className="w-full border-b border-[var(--paper-line)] bg-transparent py-1.5 text-sm outline-none focus:border-[var(--ink)]" />
          </div>
          <div>
            <label className="block text-xs text-[var(--ink-soft)] mb-1">Current balance</label>
            <input name="currentBalance" type="number" step="0.01" defaultValue={0} className="w-full border-b border-[var(--paper-line)] bg-transparent py-1.5 text-sm outline-none focus:border-[var(--ink)]" />
          </div>
          <div>
            <label className="block text-xs text-[var(--ink-soft)] mb-1">Monthly contribution</label>
            <input name="monthlyContribution" type="number" step="0.01" defaultValue={0} className="w-full border-b border-[var(--paper-line)] bg-transparent py-1.5 text-sm outline-none focus:border-[var(--ink)]" />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="text-sm px-4 py-1.5 border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
            >
              Add goal
            </button>
          </div>
        </form>
      </details>

      <SavingsGrowthChart history={history} />
    </div>
  );
}
