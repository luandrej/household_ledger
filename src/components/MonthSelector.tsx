"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { monthLabel } from "@/lib/format";

export default function MonthSelector({ month, year }: { month: number; year: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function go(newMonth: number, newYear: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", String(newMonth));
    params.set("year", String(newYear));
    router.push(`${pathname}?${params.toString()}`);
  }

  function prev() {
    if (month === 1) go(12, year - 1);
    else go(month - 1, year);
  }

  function next() {
    if (month === 12) go(1, year + 1);
    else go(month + 1, year);
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={prev}
        aria-label="Previous month"
        className="w-8 h-8 flex items-center justify-center border border-[var(--paper-line)] hover:border-[var(--ink)] transition-colors"
      >
        ‹
      </button>
      <span className="font-display text-lg min-w-[11ch] text-center">
        {monthLabel(month, year)}
      </span>
      <button
        onClick={next}
        aria-label="Next month"
        className="w-8 h-8 flex items-center justify-center border border-[var(--paper-line)] hover:border-[var(--ink)] transition-colors"
      >
        ›
      </button>
    </div>
  );
}
