"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Booking } from "@/lib/types";
import { api } from "@/lib/api";
import { taka } from "@/lib/merchant";
import { QrPlaceholder, fmtDate, methodLabel } from "./ui";

export function Confirmation({ id }: { id: string }) {
  const [b, setB] = useState<Booking>();
  useEffect(() => { api.getBooking(id).then(setB); }, [id]);
  if (!b) return <p className="p-16 text-center text-slate-500" role="status">Loading your ticket…</p>;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-600" aria-hidden>✓</div>
        <h1 className="mt-4 text-2xl font-bold">Booking confirmed!</h1>
        <p className="text-slate-600">Your e-ticket has been sent by SMS{b.contact.email ? " and email" : ""}.</p>
      </div>
      <div className="card mt-8 overflow-hidden">
        <div className="flex items-center justify-between bg-brand px-5 py-3 text-white"><span className="font-semibold">E-Ticket</span><span className="text-sm">PNR <b>{b.pnr}</b></span></div>
        <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <p className="text-xl font-bold">{b.trip.from} → {b.trip.to}</p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-slate-500">Date</dt><dd className="font-semibold">{fmtDate(b.trip.date)}</dd></div>
              <div><dt className="text-slate-500">Departure</dt><dd className="font-semibold">{b.boardingPoint.time}</dd></div>
              <div><dt className="text-slate-500">Coach</dt><dd className="font-semibold">{b.trip.coachNo} · {b.trip.coachClass}</dd></div>
              <div><dt className="text-slate-500">Seats</dt><dd className="font-semibold">{b.seats.join(", ")}</dd></div>
              <div className="col-span-2"><dt className="text-slate-500">Boarding</dt><dd className="font-semibold">{b.boardingPoint.name}</dd></div>
              <div><dt className="text-slate-500">Paid via</dt><dd className="font-semibold">{methodLabel[b.paymentMethod]}</dd></div>
              <div><dt className="text-slate-500">Total</dt><dd className="font-semibold text-accent">{taka(b.total)}</dd></div>
            </dl>
          </div>
          <div className="mx-auto text-center"><QrPlaceholder value={b.pnr} /><p className="mt-1 text-xs text-slate-500">Show at the counter</p></div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href={`/account/invoices/${b.id}`} className="btn-outline">View invoice</Link>
        <Link href={`/account/bookings/${b.id}`} className="btn-outline">Booking details</Link>
        <Link href="/" className="btn-accent">Book another trip</Link>
      </div>
    </div>
  );
}
