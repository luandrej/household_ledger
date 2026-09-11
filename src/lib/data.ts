import { db } from "./db";
import { randomUUID } from "crypto";
import type { Person } from "./auth";

export interface IncomeEntry {
  id: string;
  person: Person;
  name: string;
  amount: number;
  month: number;
  year: number;
}

export interface ExpenseEntry {
  id: string;
  person: Person;
  name: string;
  category: string | null;
  amount: number;
  recurring: boolean;
  month: number;
  year: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number | null;
  targetDate: string | null;
  currentBalance: number;
  monthlyContribution: number;
}

export interface SavingsHistoryPoint {
  goalId: string;
  balance: number;
  month: number;
  year: number;
}

// ---------- Income ----------

export function listIncome(month: number, year: number): IncomeEntry[] {
  const rows = db
    .prepare(`SELECT * FROM income_entries WHERE month = ? AND year = ? ORDER BY created_at`)
    .all(month, year) as any[];
  return rows.map(rowToIncome);
}

export function addIncome(entry: Omit<IncomeEntry, "id">): IncomeEntry {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO income_entries (id, person, name, amount, month, year) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, entry.person, entry.name, entry.amount, entry.month, entry.year);
  return { id, ...entry };
}

export function updateIncome(id: string, fields: Partial<Omit<IncomeEntry, "id">>) {
  const current = db.prepare(`SELECT * FROM income_entries WHERE id = ?`).get(id) as any;
  if (!current) return null;
  const merged = { ...rowToIncome(current), ...fields };
  db.prepare(
    `UPDATE income_entries SET person = ?, name = ?, amount = ?, month = ?, year = ? WHERE id = ?`
  ).run(merged.person, merged.name, merged.amount, merged.month, merged.year, id);
  return merged;
}

export function deleteIncome(id: string) {
  db.prepare(`DELETE FROM income_entries WHERE id = ?`).run(id);
}

function rowToIncome(row: any): IncomeEntry {
  return {
    id: row.id,
    person: row.person,
    name: row.name,
    amount: row.amount,
    month: row.month,
    year: row.year,
  };
}

// ---------- Expenses ----------

export function listExpenses(month: number, year: number): ExpenseEntry[] {
  const rows = db
    .prepare(`SELECT * FROM expense_entries WHERE month = ? AND year = ? ORDER BY created_at`)
    .all(month, year) as any[];
  return rows.map(rowToExpense);
}

export function addExpense(entry: Omit<ExpenseEntry, "id">): ExpenseEntry {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO expense_entries (id, person, name, category, amount, recurring, month, year)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    entry.person,
    entry.name,
    entry.category,
    entry.amount,
    entry.recurring ? 1 : 0,
    entry.month,
    entry.year
  );
  return { id, ...entry };
}

export function updateExpense(id: string, fields: Partial<Omit<ExpenseEntry, "id">>) {
  const current = db.prepare(`SELECT * FROM expense_entries WHERE id = ?`).get(id) as any;
  if (!current) return null;
  const merged = { ...rowToExpense(current), ...fields };
  db.prepare(
    `UPDATE expense_entries SET person = ?, name = ?, category = ?, amount = ?, recurring = ?, month = ?, year = ? WHERE id = ?`
  ).run(
    merged.person,
    merged.name,
    merged.category,
    merged.amount,
    merged.recurring ? 1 : 0,
    merged.month,
    merged.year,
    id
  );
  return merged;
}

export function deleteExpense(id: string) {
  db.prepare(`DELETE FROM expense_entries WHERE id = ?`).run(id);
}

function rowToExpense(row: any): ExpenseEntry {
  return {
    id: row.id,
    person: row.person,
    name: row.name,
    category: row.category,
    amount: row.amount,
    recurring: !!row.recurring,
    month: row.month,
    year: row.year,
  };
}

// ---------- Duplicate previous month ----------

export function duplicateMonth(fromMonth: number, fromYear: number, toMonth: number, toYear: number) {
  const existingIncome = listIncome(toMonth, toYear);
  const existingExpenses = listExpenses(toMonth, toYear);
  if (existingIncome.length > 0 || existingExpenses.length > 0) {
    throw new Error("Target month already has entries. Duplicate skipped to avoid duplicates.");
  }

  const income = listIncome(fromMonth, fromYear);
  const expenses = listExpenses(fromMonth, fromYear).filter((e) => e.recurring);

  const insertIncome = db.prepare(
    `INSERT INTO income_entries (id, person, name, amount, month, year) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertExpense = db.prepare(
    `INSERT INTO expense_entries (id, person, name, category, amount, recurring, month, year)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    for (const i of income) {
      insertIncome.run(randomUUID(), i.person, i.name, i.amount, toMonth, toYear);
    }
    for (const e of expenses) {
      insertExpense.run(
        randomUUID(),
        e.person,
        e.name,
        e.category,
        e.amount,
        e.recurring ? 1 : 0,
        toMonth,
        toYear
      );
    }
  });
  tx();

  return { incomeCopied: income.length, expensesCopied: expenses.length };
}

// ---------- Savings goals ----------

export function listSavingsGoals(): SavingsGoal[] {
  const rows = db.prepare(`SELECT * FROM savings_goals ORDER BY created_at`).all() as any[];
  return rows.map(rowToGoal);
}

export function addSavingsGoal(goal: Omit<SavingsGoal, "id">): SavingsGoal {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO savings_goals (id, name, target_amount, target_date, current_balance, monthly_contribution)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, goal.name, goal.targetAmount, goal.targetDate, goal.currentBalance, goal.monthlyContribution);
  return { id, ...goal };
}

export function updateSavingsGoal(id: string, fields: Partial<Omit<SavingsGoal, "id">>) {
  const current = db.prepare(`SELECT * FROM savings_goals WHERE id = ?`).get(id) as any;
  if (!current) return null;
  const merged = { ...rowToGoal(current), ...fields };
  db.prepare(
    `UPDATE savings_goals SET name = ?, target_amount = ?, target_date = ?, current_balance = ?, monthly_contribution = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    merged.name,
    merged.targetAmount,
    merged.targetDate,
    merged.currentBalance,
    merged.monthlyContribution,
    id
  );

  // Snapshot balance history whenever the balance changes, one entry per month.
  if (fields.currentBalance !== undefined) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const existing = db
      .prepare(`SELECT id FROM savings_history WHERE goal_id = ? AND month = ? AND year = ?`)
      .get(id, month, year) as any;
    if (existing) {
      db.prepare(`UPDATE savings_history SET balance = ? WHERE id = ?`).run(
        merged.currentBalance,
        existing.id
      );
    } else {
      db.prepare(
        `INSERT INTO savings_history (id, goal_id, balance, month, year) VALUES (?, ?, ?, ?, ?)`
      ).run(randomUUID(), id, merged.currentBalance, month, year);
    }
  }

  return merged;
}

export function deleteSavingsGoal(id: string) {
  db.prepare(`DELETE FROM savings_goals WHERE id = ?`).run(id);
}

export function listSavingsHistory(): SavingsHistoryPoint[] {
  const rows = db
    .prepare(`SELECT goal_id as goalId, balance, month, year FROM savings_history ORDER BY year, month`)
    .all() as any[];
  return rows;
}

function rowToGoal(row: any): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: row.target_amount,
    targetDate: row.target_date,
    currentBalance: row.current_balance,
    monthlyContribution: row.monthly_contribution,
  };
}

// ---------- Aggregates for dashboard ----------

export function monthTotals(month: number, year: number) {
  const income = listIncome(month, year);
  const expenses = listExpenses(month, year);
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    percentSpent: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0,
  };
}

export function trailingMonths(count: number, month: number, year: number) {
  const result: { month: number; year: number }[] = [];
  let m = month;
  let y = year;
  for (let i = 0; i < count; i++) {
    result.unshift({ month: m, year: y });
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  return result;
}
