import type { Metadata } from "next";
import { getCities, searchTrips } from "@/lib/transport";
import { BookingForm } from "@/components/BookingForm";
import { SearchResults } from "@/components/SearchResults";
import { StateMessage } from "@/components/StateMessage";

export const metadata: Metadata = { title: "Search buses" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const tomorrow = () => new Date(new Date().getTime() + 86400000).toISOString().slice(0, 10);
const one = (v: string | string[] | undefined, d: string) => (Array.isArray(v) ? v[0] : v) ?? d;

/** GET bus/search?from=&to=&date= (cached 60 s per tenant on the API, revalidated here every 60 s). */
export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = {
    from: one(sp.from, ""), to: one(sp.to, ""), date: one(sp.date, "") || tomorrow(),
    passengers: Math.max(1, Number(one(sp.passengers, "1")) || 1), returnDate: one(sp.returnDate, "") || undefined,
  };
  const ready = Boolean(q.from && q.to);
  const [cities, trips] = await Promise.all([getCities().catch(() => []), ready ? searchTrips(q) : Promise.resolve([])]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <details className="card mb-5 p-4 md:open:p-5" open>
        <summary className="cursor-pointer list-none font-semibold text-brand">
          {ready ? <>{q.from} → {q.to} · {new Date(q.date).toDateString()} · {q.passengers} passenger{q.passengers > 1 ? "s" : ""} <span className="text-sm text-accent">(modify)</span></> : "Search buses"}
        </summary>
        <div className="mt-4"><BookingForm compact initial={q} cities={cities} /></div>
      </details>
      {!ready ? <StateMessage title="Where are you going?" body="Choose your From and To cities and a journey date." />
        : trips.length ? <SearchResults trips={trips} passengers={q.passengers} />
        : <StateMessage title="No buses found" body={`There are no ${q.from} → ${q.to} trips on ${new Date(q.date).toDateString()}. Try another date.`} />}
    </div>
  );
}
