import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { merchant, taka } from "@/lib/merchant";
import { QrPlaceholder, StatusBadge, fmtDate, methodLabel } from "@/components/ui";

export const metadata: Metadata = { title: "Booking details" };

export default async function BookingDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await api.getBooking(id);
  if (!b) notFound();
  return (
    <div className="space-y-5">
      <nav className="text-sm text-slate-500" aria-label="Breadcrumb"><Link href="/account/bookings" className="hover:text-brand">My bookings</Link> › {b.pnr}</nav>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{b.trip.from} → {b.trip.to}</h1><StatusBadge s={b.status} />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">
        <section className="card p-5">
          <h2 className="mb-4 font-bold">Journey</h2>
          <div className="flex items-center justify-between gap-3 text-center">
            <div><p className="text-2xl font-extrabold">{b.boardingPoint.time}</p><p className="text-sm text-slate-500">{b.boardingPoint.name}</p></div>
            <div className="flex-1 text-xs text-slate-500">{b.trip.duration}<div className="my-1 h-px bg-slate-300" />{fmtDate(b.trip.date)}</div>
            <div><p className="text-2xl font-extrabold">{b.droppingPoint.time}</p><p className="text-sm text-slate-500">{b.droppingPoint.name}</p></div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-sm sm:grid-cols-3">
            <div><dt className="text-slate-500">PNR</dt><dd className="font-semibold">{b.pnr}</dd></div>
            <div><dt className="text-slate-500">Booking ID</dt><dd className="font-semibold">{b.id}</dd></div>
            <div><dt className="text-slate-500">Coach</dt><dd className="font-semibold">{b.trip.coachNo} · {b.trip.coachClass}</dd></div>
          </dl>
          <h2 className="mb-2 mt-6 font-bold">Passengers</h2>
          <ul className="divide-y rounded-xl border text-sm">
            {b.passengers.map((p) => <li key={p.seat} className="flex justify-between p-3"><span>{p.name} <span className="text-slate-500">· {p.gender}, {p.age}</span></span><b>Seat {p.seat}</b></li>)}
          </ul>
        </section>
        <aside className="space-y-5">
          <div className="card p-5 text-center"><QrPlaceholder value={b.pnr} size={150} /><p className="mt-2 text-xs text-slate-500">Show this at the {merchant.shortName} counter</p></div>
          <div className="card p-5">
            <h2 className="mb-3 font-bold">Payment</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between"><dt>Fare</dt><dd>{taka(b.fare)}</dd></div>
              <div className="flex justify-between"><dt>Service fee</dt><dd>{taka(b.serviceFee)}</dd></div>
              {b.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd>-{taka(b.discount)}</dd></div>}
              <div className="flex justify-between border-t pt-2 font-bold"><dt>Paid ({methodLabel[b.paymentMethod]})</dt><dd className="text-accent">{taka(b.total)}</dd></div>
            </dl>
          </div>
          <div className="flex flex-col gap-2">
            <Link href={`/account/invoices/${b.id}`} className="btn-outline">View invoice</Link>
            {b.status === "upcoming" && <a href={`tel:${merchant.contact.hotline}`} className="btn-outline !border-red-300 !text-red-600 hover:!bg-red-50">Cancel booking (call support)</a>}
            <a href={`mailto:${merchant.contact.email}?subject=Booking ${b.pnr}`} className="text-center text-sm font-semibold text-brand">Contact support</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
