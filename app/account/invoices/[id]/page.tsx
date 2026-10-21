import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/storefront";
import { authed, getBooking, getInvoice } from "@/lib/account";
import { toView } from "@/lib/booking-view";
import { getSite } from "@/lib/site";
import { taka } from "@/lib/merchant";
import { PrintButton } from "@/components/PrintButton";
import { PriceLines } from "@/components/PriceLines";
import { fmtDate } from "@/components/ui";

export const metadata: Metadata = { title: "Invoice" };

/** GET bookings/{id} + GET bookings/{id}/invoice (signed PDF/HTML links valid 30 min). */
export default async function Invoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [merchant, raw, inv] = await Promise.all([
    getSite(),
    authed(() => getBooking(id), `/account/invoices/${id}`).catch((e) => { if (e instanceof ApiError && e.status === 404) notFound(); throw e; }),
    getInvoice(id).catch(() => null),
  ]);
  const b = toView(raw);
  const paid = /^(paid|success|completed)$/.test(b.payment?.status ?? "");
  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between gap-3">
        <Link href={`/account/bookings/${b.id}`} className="text-sm text-slate-500 hover:text-brand">‹ Back to booking</Link>
        <div className="flex gap-2">
          {inv?.pdfUrl && <a href={inv.pdfUrl} className="btn-outline !py-1.5 text-sm" target="_blank" rel="noopener">Download PDF</a>}
          <PrintButton />
        </div>
      </div>
      <article className="mx-auto max-w-[794px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10 print:shadow-none print:ring-0">
        <header className="flex flex-col justify-between gap-4 border-b-4 border-brand pb-5 sm:flex-row">
          <div>
            <p className="text-2xl font-extrabold text-brand">{merchant.name}</p>
            <p className="text-xs text-slate-500">{merchant.contact.address}<br />{[merchant.contact.phone, merchant.contact.email].filter(Boolean).join(" · ")}</p>
          </div>
          <div className="sm:text-right">
            <h1 className="text-3xl font-extrabold tracking-wide text-slate-800">INVOICE</h1>
            <p className="text-sm">No. <b>{inv?.pnr ?? b.pnr}</b></p>
            {b.createdAt && <p className="text-sm">Date: {fmtDate(b.createdAt)}</p>}
            <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-bold ${paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{paid ? "PAID" : "UNPAID"}</span>
          </div>
        </header>
        <section className="grid gap-4 py-5 text-sm sm:grid-cols-2">
          <div><p className="text-xs font-bold uppercase text-slate-500">Booking</p><p className="font-semibold">{b.title}</p><p>{b.date ? fmtDate(b.date) : ""}{b.endDate ? ` – ${fmtDate(b.endDate)}` : ""}</p><p>{b.units.join(", ")}</p></div>
          {b.people.length > 0 && <div className="sm:text-right"><p className="text-xs font-bold uppercase text-slate-500">Travellers</p>{b.people.map((p, i) => <p key={i}>{p.name}</p>)}</div>}
        </section>
        <div className="max-w-sm sm:ml-auto"><PriceLines b={b} paidLabel={paid ? "Total paid" : "Total payable"} /></div>
        {!b.price && inv && <p className="mt-2 text-right text-sm">Total {taka(inv.total)}</p>}
        <footer className="mt-10 border-t pt-4 text-center text-xs text-slate-500">
          This is a computer-generated invoice and needs no signature.<br />© {new Date().getFullYear()} {merchant.name}. All rights reserved. · {merchant.poweredBy.label}
        </footer>
      </article>
    </div>
  );
}
