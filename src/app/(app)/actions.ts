"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import * as data from "@/lib/data";

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}

function personFromForm(formData: FormData): data.IncomeEntry["person"] {
  const raw = String(formData.get("person") || "");
  return raw === "WIFE" ? "WIFE" : "LU";
}

// ---------- Income ----------

export async function addIncomeAction(formData: FormData) {
  await requireSession();
  data.addIncome({
    person: personFromForm(formData),
    name: String(formData.get("name") || "").trim(),
    amount: Number(formData.get("amount") || 0),
    month: Number(formData.get("month")),
    year: Number(formData.get("year")),
  });
  revalidateBudgetPaths();
}

export async function deleteIncomeAction(formData: FormData) {
  await requireSession();
  data.deleteIncome(String(formData.get("id")));
  revalidateBudgetPaths();
}

// ---------- Expenses ----------

export async function addExpenseAction(formData: FormData) {
  await requireSession();
  data.addExpense({
    person: personFromForm(formData),
    name: String(formData.get("name") || "").trim(),
    category: String(formData.get("category") || "").trim() || null,
    amount: Number(formData.get("amount") || 0),
    recurring: formData.get("recurring") === "on",
    month: Number(formData.get("month")),
    year: Number(formData.get("year")),
  });
  revalidateBudgetPaths();
}

export async function deleteExpenseAction(formData: FormData) {
  await requireSession();
  data.deleteExpense(String(formData.get("id")));
  revalidateBudgetPaths();
}

// ---------- Duplicate month ----------

export async function duplicateMonthAction(formData: FormData) {
  await requireSession();
  const fromMonth = Number(formData.get("fromMonth"));
  const fromYear = Number(formData.get("fromYear"));
  const toMonth = Number(formData.get("toMonth"));
  const toYear = Number(formData.get("toYear"));
  try {
    data.duplicateMonth(fromMonth, fromYear, toMonth, toYear);
  } catch {
    // Silently ignore if the target month already has entries - dashboard will look unchanged.
  }
  revalidateBudgetPaths();
}

// ---------- Savings ----------

export async function addSavingsGoalAction(formData: FormData) {
  await requireSession();
  const targetAmountRaw = String(formData.get("targetAmount") || "").trim();
  const targetDateRaw = String(formData.get("targetDate") || "").trim();
  data.addSavingsGoal({
    name: String(formData.get("name") || "").trim(),
    targetAmount: targetAmountRaw ? Number(targetAmountRaw) : null,
    targetDate: targetDateRaw || null,
    currentBalance: Number(formData.get("currentBalance") || 0),
    monthlyContribution: Number(formData.get("monthlyContribution") || 0),
  });
  revalidatePath("/savings");
}

export async function updateSavingsBalanceAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id"));
  const currentBalance = Number(formData.get("currentBalance") || 0);
  data.updateSavingsGoal(id, { currentBalance });
  revalidatePath("/savings");
}

export async function deleteSavingsGoalAction(formData: FormData) {
  await requireSession();
  data.deleteSavingsGoal(String(formData.get("id")));
  revalidatePath("/savings");
}

function revalidateBudgetPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/budget/lu");
  revalidatePath("/budget/wife");
}
