import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "./logout-action";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const wifeDisplayName = process.env.WIFE_DISPLAY_NAME || "Wife";

  const tabs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/budget/lu", label: "Lu" },
    { href: "/budget/wife", label: wifeDisplayName },
    { href: "/savings", label: "Savings & Investments" },
  ];

  return (
    <div className="min-h-screen">
      <header className="px-6 pt-8 pb-0 max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold">The Household Ledger</h1>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
            >
              Sign out ({session.displayName})
            </button>
          </form>
        </div>
        <nav className="flex gap-8 ledger-rule-thick pt-0">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="text-sm py-3 -mt-px border-t-2 border-transparent hover:border-[var(--brass)] transition-colors"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
