import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/storefront";
import { authed, getBooking } from "@/lib/account";
import { toView } from "@/lib/booking-view";
import { copy } from "@/lib/copy";
import { QrPlaceholder, fmtDate } from "@/components/ui";
import { PriceLines } from "@/components/PriceLines";

export const metadata: Metadata = { title: "Booking confirmed" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const raw = await authed(() => getBooking(id), `/booking/${id}/confirmation`).catch((e) => { if (e instanceof ApiError && e.status === 404) notFound(); throw e; });
  const b = toView(raw);
  const paid = /^(paid|success|completed)$/.test(b.payment?.status ?? "");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-3xl ${paid ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`} aria-hidden>{paid ? "✓" : "…"}</div>
        <h1 className="mt-4 text-2xl font-bold">{paid ? "Booking confirmed!" : "Booking received"}</h1>
        <p className="text-slate-600">{paid ? `Your ${copy.ticket} is ready.` : "We are waiting for payment confirmation from the gateway."}</p>
      </div>
      <div className="card mt-8 overflow-hidden">
        <div className="flex items-center justify-between bg-brand px-5 py-3 text-white"><span className="font-semibold">{copy.Ticket}</span><span className="text-sm">{copy.ref} <b>{b.pnr}</b></span></div>
        <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <p className="text-xl font-bold">{b.title}</p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {b.date && <div><dt className="text-slate-500">{b.endDate ? "Check-in" : "Date"}</dt><dd className="font-semibold">{fmtDate(b.date)}{b.time ? ` · ${b.time}` : ""}</dd></div>}
              {b.endDate && <div><dt className="text-slate-500">Check-out</dt><dd className="font-semibold">{fmtDate(b.endDate)}</dd></div>}
              {b.units.length > 0 && <div><dt className="text-slate-500">{copy.unitsCol}</dt><dd className="font-semibold">{b.units.join(", ")}</dd></div>}
            </dl>
            <PriceLines b={b} paidLabel={paid ? "Paid" : "Payable"} />
          </div>
          <div className="mx-auto text-center"><QrPlaceholder value={b.pnr} /><p className="mt-1 text-xs text-slate-500">Show at the {copy.counter}</p></div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href={`/account/invoices/${b.id}`} className="btn-outline">View invoice</Link>
        <Link href={`/account/bookings/${b.id}`} className="btn-outline">Booking details</Link>
        <Link href="/" className="btn-accent">{copy.again}</Link>
      </div>
    </div>
  );
}
