import type { Metadata } from "next";
import { api } from "@/lib/api";
import { BookingForm } from "@/components/BookingForm";
import { SearchResults } from "@/components/SearchResults";

export const metadata: Metadata = { title: "Search buses" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined, d: string) => (Array.isArray(v) ? v[0] : v) ?? d;

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = {
    from: one(sp.from, "Dhaka"), to: one(sp.to, "Cox's Bazar"), date: one(sp.date, "2026-10-24"),
    passengers: Number(one(sp.passengers, "1")), returnDate: one(sp.returnDate, "") || undefined,
  };
  const trips = await api.searchTrips(q);
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <details className="card mb-5 p-4 md:open:p-5" open>
        <summary className="cursor-pointer list-none font-semibold text-brand">
          {q.from} → {q.to} · {new Date(q.date).toDateString()} · {q.passengers} passenger{q.passengers > 1 ? "s" : ""} <span className="text-sm text-accent">(modify)</span>
        </summary>
        <div className="mt-4"><BookingForm compact initial={q} /></div>
      </details>
      <SearchResults trips={trips} passengers={q.passengers} />
    </div>
  );
}
