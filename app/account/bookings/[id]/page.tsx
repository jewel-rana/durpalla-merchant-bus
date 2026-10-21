import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/storefront";
import { authed, getBooking, getCancellation } from "@/lib/account";
import { toView } from "@/lib/booking-view";
import { getSite } from "@/lib/site";
import { copy } from "@/lib/copy";
import { QrPlaceholder, StatusBadge, fmtDate } from "@/components/ui";
import { PriceLines } from "@/components/PriceLines";
import { CancelButton } from "@/components/CancelButton";
import { PayButton } from "@/components/PayButton";

export const metadata: Metadata = { title: "Booking details" };

export default async function BookingDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [merchant, raw] = await Promise.all([
    getSite(),
    authed(() => getBooking(id), `/account/bookings/${id}`).catch((e) => { if (e instanceof ApiError && e.status === 404) notFound(); throw e; }),
  ]);
  const b = toView(raw);
  const paid = b.payment?.status === "paid" || b.payment?.status === "success" || b.payment?.status === "completed";
  const cq = b.status === "upcoming" && paid ? await getCancellation(id).catch(() => null) : null;
  return (
    <div className="space-y-5">
      <nav className="text-sm text-slate-500" aria-label="Breadcrumb"><Link href="/account/bookings" className="hover:text-brand">My bookings</Link> › {b.pnr}</nav>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{b.title}</h1><StatusBadge s={b.status} />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">
        <section className="card p-5">
          <h2 className="mb-4 font-bold">{copy.Trip}</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div><dt className="text-slate-500">{copy.ref}</dt><dd className="font-semibold">{b.pnr}</dd></div>
            <div><dt className="text-slate-500">Booking ID</dt><dd className="font-semibold">{b.id}</dd></div>
            {b.date && <div><dt className="text-slate-500">{b.endDate ? "Check-in" : "Date"}</dt><dd className="font-semibold">{fmtDate(b.date)}{b.time ? ` · ${b.time}` : ""}</dd></div>}
            {b.endDate && <div><dt className="text-slate-500">Check-out</dt><dd className="font-semibold">{fmtDate(b.endDate)}</dd></div>}
            {b.units.length > 0 && <div><dt className="text-slate-500">{copy.unitsCol}</dt><dd className="font-semibold">{b.units.join(", ")}</dd></div>}
            {b.guests && <div><dt className="text-slate-500">Guests</dt><dd className="font-semibold">{b.guests.adults} adult{b.guests.adults === 1 ? "" : "s"}{b.guests.children ? `, ${b.guests.children} child` : ""}</dd></div>}
            <div><dt className="text-slate-500">Status</dt><dd className="font-semibold capitalize">{b.rawStatus.replace(/_/g, " ")}</dd></div>
          </dl>
          {b.people.length > 0 && (<>
            <h2 className="mb-2 mt-6 font-bold">Passengers</h2>
            <ul className="divide-y rounded-xl border text-sm">
              {b.people.map((p, i) => <li key={i} className="flex justify-between p-3"><span>{p.name} {p.meta && <span className="text-slate-500">· {p.meta}</span>}</span>{p.unit && <b>{copy.unit} {p.unit}</b>}</li>)}
            </ul>
          </>)}
        </section>
        <aside className="space-y-5">
          <div className="card p-5 text-center"><QrPlaceholder value={b.pnr} size={150} /><p className="mt-2 text-xs text-slate-500">Show this at {merchant.shortName} {copy.counter}</p></div>
          <div className="card p-5">
            <h2 className="mb-3 font-bold">Payment {b.payment?.status && <span className="ml-1 text-xs font-medium capitalize text-slate-500">· {b.payment.status}</span>}</h2>
            <PriceLines b={b} paidLabel={paid ? "Paid" : "Payable"} />
            {!paid && b.status === "upcoming" && <div className="mt-4"><PayButton bookingId={b.id} /></div>}
          </div>
          <div className="flex flex-col gap-2">
            <Link href={`/account/invoices/${b.id}`} className="btn-outline">View invoice</Link>
            {cq?.cancellable && <CancelButton id={b.id} refundable={cq.refundPreview?.refundable} gatewayFee={cq.refundPreview?.gatewayFee} />}
            {merchant.contact.email && <a href={`mailto:${merchant.contact.email}?subject=Booking ${b.pnr}`} className="text-center text-sm font-semibold text-brand">Contact support</a>}
          </div>
        </aside>
      </div>
    </div>
  );
}
