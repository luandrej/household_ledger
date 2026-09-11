CREATE TABLE IF NOT EXISTS income_entries (
  id TEXT PRIMARY KEY,
  person TEXT NOT NULL CHECK (person IN ('LU','WIFE')),
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_income_month_year ON income_entries (year, month);

CREATE TABLE IF NOT EXISTS expense_entries (
  id TEXT PRIMARY KEY,
  person TEXT NOT NULL CHECK (person IN ('LU','WIFE')),
  name TEXT NOT NULL,
  category TEXT,
  amount REAL NOT NULL,
  recurring INTEGER NOT NULL DEFAULT 1,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_expense_month_year ON expense_entries (year, month);

CREATE TABLE IF NOT EXISTS savings_goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount REAL,
  target_date TEXT,
  current_balance REAL NOT NULL DEFAULT 0,
  monthly_contribution REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS savings_history (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  balance REAL NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_savings_history_goal ON savings_history (goal_id, year, month);
