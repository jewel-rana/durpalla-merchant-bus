import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { merchant, taka } from "@/lib/merchant";
import { PrintButton } from "@/components/PrintButton";
import { fmtDate, methodLabel } from "@/components/ui";

export const metadata: Metadata = { title: "Invoice" };

export default async function Invoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await api.getBooking(id);
  if (!b) notFound();
  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href={`/account/bookings/${b.id}`} className="text-sm text-slate-500 hover:text-brand">‹ Back to booking</Link>
        <PrintButton />
      </div>
      <article className="mx-auto max-w-[794px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10 print:shadow-none print:ring-0">
        <header className="flex flex-col justify-between gap-4 border-b-4 border-brand pb-5 sm:flex-row">
          <div>
            <p className="text-2xl font-extrabold text-brand">{merchant.name}</p>
            <p className="text-xs text-slate-500">{merchant.contact.address}<br />{merchant.contact.phone} · {merchant.contact.email}</p>
          </div>
          <div className="sm:text-right">
            <h1 className="text-3xl font-extrabold tracking-wide text-slate-800">INVOICE</h1>
            <p className="text-sm">No. <b>INV-{b.id.slice(2)}</b></p>
            <p className="text-sm">Date: {fmtDate(b.createdAt)}</p>
            <span className="mt-1 inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">PAID</span>
          </div>
        </header>
        <section className="grid gap-4 py-5 text-sm sm:grid-cols-2">
          <div><p className="text-xs font-bold uppercase text-slate-500">Billed to</p><p className="font-semibold">{b.passengers[0]?.name}</p><p>{b.contact.phone}</p><p>{b.contact.email}</p></div>
          <div className="sm:text-right"><p className="text-xs font-bold uppercase text-slate-500">Journey</p><p className="font-semibold">{b.trip.from} → {b.trip.to}</p><p>{fmtDate(b.trip.date)} · {b.boardingPoint.time}</p><p>PNR {b.pnr} · {b.trip.coachNo}</p></div>
        </section>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead><tr className="bg-brand text-white"><th className="px-3 py-2">Description</th><th className="px-3 py-2">Seat</th><th className="px-3 py-2 text-right">Amount</th></tr></thead>
            <tbody>
              {b.passengers.map((p) => (
                <tr key={p.seat} className="border-b"><td className="px-3 py-2">Bus fare – {b.trip.coachClass} ({p.name})</td><td className="px-3 py-2">{p.seat}</td><td className="px-3 py-2 text-right">{taka(b.fare / b.seats.length)}</td></tr>
              ))}
              <tr className="border-b"><td className="px-3 py-2" colSpan={2}>Service fee</td><td className="px-3 py-2 text-right">{taka(b.serviceFee)}</td></tr>
              {b.discount > 0 && <tr className="border-b"><td className="px-3 py-2" colSpan={2}>Discount</td><td className="px-3 py-2 text-right">-{taka(b.discount)}</td></tr>}
            </tbody>
            <tfoot><tr><td className="px-3 py-3 text-right font-bold" colSpan={2}>Total paid</td><td className="px-3 py-3 text-right text-lg font-extrabold text-accent">{taka(b.total)}</td></tr></tfoot>
          </table>
        </div>
        <p className="mt-4 text-sm">Payment method: <b>{methodLabel[b.paymentMethod]}</b> · Transaction ref: TXN{b.id.slice(2)}</p>
        <footer className="mt-10 border-t pt-4 text-center text-xs text-slate-500">
          This is a computer-generated invoice and needs no signature.<br />© 2026 {merchant.name}. All rights reserved. Powered by Durpalla Limited
        </footer>
      </article>
    </div>
  );
}
