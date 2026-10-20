import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { taka } from "@/lib/merchant";
import { BookingTable } from "@/components/BookingTable";
import { QrPlaceholder, fmtDate } from "@/components/ui";

export const metadata: Metadata = { title: "My account" };

export default async function Dashboard() {
  const [me, list] = await Promise.all([api.getProfile(), api.listBookings()]);
  const next = list.find((b) => b.status === "upcoming");
  const spent = list.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.total, 0);
  const stats = [
    { l: "Upcoming trips", v: list.filter((b) => b.status === "upcoming").length },
    { l: "Completed trips", v: list.filter((b) => b.status === "completed").length },
    { l: "Total spent", v: taka(spent) },
    { l: "Reward points", v: 340 },
  ];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Hello, {me.name.split(" ")[0]} 👋</h1><p className="text-slate-500">Here&apos;s an overview of your trips.</p></div>
      <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => <div key={s.l} className="card p-4"><dt className="text-xs text-slate-500">{s.l}</dt><dd className="mt-1 text-2xl font-extrabold text-brand">{s.v}</dd></div>)}
      </dl>
      {next && (
        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-dark to-brand p-5 text-white md:p-6" aria-label="Next trip">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-300">Next trip</p>
              <p className="mt-1 text-2xl font-bold">{next.trip.from} → {next.trip.to}</p>
              <p className="text-white/80">{fmtDate(next.trip.date)} · {next.trip.departure} · {next.trip.coachNo} · Seats {next.seats.join(", ")}</p>
              <p className="text-sm text-white/70">Board at {next.boardingPoint.name}</p>
              <Link href={`/account/bookings/${next.id}`} className="btn-accent mt-4 !py-2 text-sm">View ticket</Link>
            </div>
            <QrPlaceholder value={next.pnr} size={110} />
          </div>
        </section>
      )}
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Recent bookings</h2><Link href="/account/bookings" className="text-sm font-semibold text-brand">See all</Link></div>
        <BookingTable items={list.slice(0, 3)} />
      </section>
    </div>
  );
}
