"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-xs tracking-wide text-[var(--ink-soft)] mb-2">Household</p>
          <h1 className="font-display text-3xl font-semibold">The Ledger</h1>
        </div>

        <form action={formAction} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm text-[var(--ink-soft)] mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full border-b-2 border-[var(--paper-line)] bg-transparent py-2 text-lg outline-none focus:border-[var(--ink)] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-[var(--ink-soft)] mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full border-b-2 border-[var(--paper-line)] bg-transparent py-2 text-lg outline-none focus:border-[var(--ink)] transition-colors"
            />
          </div>

          {state?.error && (
            <p className="text-sm" style={{ color: "var(--rust)" }}>
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full mt-4 py-3 font-medium text-[var(--paper)] transition-opacity disabled:opacity-60"
            style={{ background: "var(--ink)" }}
          >
            {pending ? "Checking..." : "Open the ledger"}
          </button>
        </form>
      </div>
    </div>
  );
}
