import type { Metadata } from "next";
import Link from "next/link";
import { requireMe } from "@/lib/account";
import { taka } from "@/lib/merchant";
import { copy } from "@/lib/copy";
import { loadBookings } from "@/lib/loadBookings";
import { BookingTable } from "@/components/BookingTable";
import { QrPlaceholder, fmtDate } from "@/components/ui";

export const metadata: Metadata = { title: "My account" };

export default async function Dashboard() {
  const [me, upcoming, completed] = await Promise.all([requireMe("/account"), loadBookings("upcoming", 5), loadBookings("completed", 0)]);
  const next = upcoming[0];
  const spent = [...upcoming, ...completed].reduce((s, b) => s + b.total, 0);
  const stats = [
    { l: `Upcoming ${copy.trips}`, v: upcoming.length },
    { l: `Completed ${copy.trips}`, v: completed.length },
    { l: "Total spent", v: taka(spent) },
  ];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Hello, {me.name.split(" ")[0]} 👋</h1><p className="text-slate-500">Here&apos;s an overview of your {copy.trips}.</p></div>
      <dl className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {stats.map((s) => <div key={s.l} className="card p-4"><dt className="text-xs text-slate-500">{s.l}</dt><dd className="mt-1 text-2xl font-extrabold text-brand">{s.v}</dd></div>)}
      </dl>
      {next && (
        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-dark to-brand p-5 text-white md:p-6" aria-label={`Next ${copy.trip}`}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-300">Next {copy.trip}</p>
              <p className="mt-1 text-2xl font-bold">{next.title}</p>
              <p className="text-white/80">{next.date ? fmtDate(next.date) : ""}{next.endDate ? ` – ${fmtDate(next.endDate)}` : next.time ? ` · ${next.time}` : ""}{next.units.length ? ` · ${next.units.join(", ")}` : ""}</p>
              <Link href={`/account/bookings/${next.id}`} className="btn-accent mt-4 !py-2 text-sm">View {copy.ticket}</Link>
            </div>
            <QrPlaceholder value={next.pnr} size={110} />
          </div>
        </section>
      )}
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Upcoming bookings</h2><Link href="/account/bookings" className="text-sm font-semibold text-brand">See all</Link></div>
        <BookingTable items={upcoming.slice(0, 3)} />
      </section>
    </div>
  );
}
