import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// The db file lives in a mounted volume so data survives container restarts/rebuilds.
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "budget.db");

declare global {
  // eslint-disable-next-line no-var
  var __budgetDb: Database.Database | undefined;
}

function createConnection() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const schemaPath = path.join(process.cwd(), "src", "lib", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);

  return db;
}

// Reuse a single connection across hot-reloads in dev and across requests in prod.
export const db = global.__budgetDb ?? createConnection();
if (process.env.NODE_ENV !== "production") {
  global.__budgetDb = db;
}
