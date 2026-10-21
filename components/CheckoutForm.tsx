"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Passenger, Trip } from "@/lib/types";
import { customerPaysFee, taka } from "@/lib/merchant";
import { useSite } from "@/lib/site-context";
import { createBusBooking, quoteTrip } from "@/lib/bus-actions";
import type { TripQuote } from "@/lib/types";
import { initiatePayment } from "@/lib/auth-actions";

const brand: Record<string, string> = { bkash: "text-[#E2136E]", nagad: "text-[#EC1C24]", rocket: "text-[#8C3494]", sslcommerz: "text-[#1A1F71]", card: "text-[#1A1F71]" };

export interface CheckoutSeat { id: string; label: string; fare: number }

/**
 * 🔒 POST bookings (vertical bus) → POST payments/initiate → gateway redirect.
 * Methods and the gateway-fee rule come from GET config (`payments`); the final amount is the API's.
 */
export function CheckoutForm({ trip, seats, boardId, dropId, phone: initialPhone }: { trip: Trip; seats: CheckoutSeat[]; boardId: string; dropId: string; phone?: string }) {
  const site = useSite();
  const router = useRouter();
  const methods = site.payments.methods;
  const [pax, setPax] = useState<Passenger[]>(seats.map((s) => ({ seat: s.id, seatLabel: s.label, name: "", gender: "male", age: 30 })));
  const [phone, setPhone] = useState((initialPhone ?? "").replace(/^\+?88/, ""));
  const [email, setEmail] = useState("");
  const [promo, setPromo] = useState("");
  const [method, setMethod] = useState(methods[0]?.code ?? "");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const board = trip.boardingPoints.find((p) => p.id === boardId) ?? trip.boardingPoints[0];
  const drop = trip.droppingPoints.find((p) => p.id === dropId) ?? trip.droppingPoints[0];
  const [quote, setQuote] = useState<TripQuote | null>(null);
  const [promoMsg, setPromoMsg] = useState("");
  // Estimate until the API quote (POST bus/trips/{id}/quote) arrives; the quote is what the booking will charge.
  const localFare = seats.reduce((s, x) => s + (x.fare || trip.fare), 0);
  const feePct = customerPaysFee(site) ? site.payments.gatewayFeePercent : 0;
  const fare = quote?.breakdown.fare ?? localFare;
  const fee = quote ? quote.breakdown.gatewayFee : Math.round(localFare * feePct) / 100;
  const total = quote?.breakdown.total ?? localFare + fee;
  const seatKey = seats.map((s) => s.id).join(",");

  const loadQuote = useCallback((code?: string) => quoteTrip(trip.id, seatKey.split(",").filter(Boolean), code).then((r) => {
    if (!r.ok) return setPromoMsg(code ? r.message : "");
    setQuote(r.data);
    setPromoMsg(code ? (r.data.promo?.valid ? `✓ ${r.data.promo.code} applied` : r.data.promo?.message || "Invalid promo code") : "");
  }), [trip.id, seatKey]);
  useEffect(() => { void loadQuote(); }, [loadQuote]);

  const upd = (i: number, p: Partial<Passenger>) => setPax(pax.map((x, k) => (k === i ? { ...x, ...p } : x)));

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!/^01\d{9}$/.test(phone)) return setErr("Enter a valid 11-digit mobile number (01XXXXXXXXX).");
    if (!method) return setErr("Online payment is not available for this merchant yet.");
    if (!agree) return setErr("Please accept the terms to continue.");
    setErr(""); setBusy(true);
    const b = await createBusBooking({
      tripId: trip.id, seatIds: seats.map((s) => s.id), boardingPoint: board?.id, promoCode: promo.trim() || undefined,
      passengers: pax.map((p) => ({ name: p.name, mobile: phone, gender: p.gender, age: p.age })),
    });
    if (!b.ok) { setBusy(false); return setErr(b.code === "SEAT_UNAVAILABLE" ? "One of your seats was just taken. Please pick again." : b.message); }
    const p = await initiatePayment(b.data.id, method);
    if (p.ok && p.data.redirectUrl) { window.location.href = p.data.redirectUrl; return; }
    setBusy(false);
    if (!p.ok) setErr(`Booking ${b.data.pnr ?? b.data.id} was created but payment could not start: ${p.message}`);
    router.push(`/account/bookings/${b.data.id}`);
  }

  return (
    <form onSubmit={pay} className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 pb-32 md:px-8 lg:grid-cols-[1fr_380px] lg:pb-10">
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Passenger details</h1>
        {pax.map((p, i) => (
          <fieldset key={p.seat} className="card p-5">
            <legend className="sr-only">Passenger {i + 1}</legend>
            <p className="mb-3 font-semibold">Passenger {i + 1} <span className="ml-2 rounded-md bg-brand-light px-2 py-0.5 text-xs text-brand">Seat {p.seatLabel}</span></p>
            <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
              <div><label className="label" htmlFor={`n${i}`}>Full name</label><input id={`n${i}`} className="field" required value={p.name} onChange={(e) => upd(i, { name: e.target.value })} placeholder="As on NID" /></div>
              <div><label className="label" htmlFor={`g${i}`}>Gender</label>
                <select id={`g${i}`} className="field" value={p.gender} onChange={(e) => upd(i, { gender: e.target.value as Passenger["gender"] })}><option value="male">Male</option><option value="female">Female</option></select></div>
              <div><label className="label" htmlFor={`a${i}`}>Age</label><input id={`a${i}`} type="number" min={1} max={120} className="field" value={p.age} onChange={(e) => upd(i, { age: Number(e.target.value) })} /></div>
            </div>
          </fieldset>
        ))}
        <fieldset className="card p-5">
          <legend className="sr-only">Contact</legend>
          <p className="mb-3 font-semibold">Contact details <span className="text-xs font-normal text-slate-500">(e-ticket will be sent here)</span></p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="phone">Mobile number</label><input id="phone" inputMode="numeric" className="field" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="01XXXXXXXXX" /></div>
            <div><label className="label" htmlFor="email">Email (optional)</label><input id="email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
          </div>
        </fieldset>
        <fieldset className="card p-5">
          <legend className="mb-3 px-1 font-semibold">Payment method</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {methods.map((m) => (
              <label key={m.code} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${method === m.code ? "border-accent bg-orange-50" : "border-slate-200"}`}>
                <input type="radio" name="method" value={m.code} checked={method === m.code} onChange={() => setMethod(m.code)} className="accent-[var(--accent)]" />
                <span className={`font-extrabold ${brand[m.code] ?? "text-slate-800"}`}>{m.name}</span>
              </label>
            ))}
            {!methods.length && <p className="text-sm text-slate-500">Online payment: coming soon for this merchant.</p>}
          </div>
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">🔒 Secure payment{site.payments.mode === "durpalla" ? <> powered by <b>Durpalla Limited</b></> : null}</p>
          <div className="mt-4"><label className="label" htmlFor="promo">Promo code (optional)</label>
            <div className="flex gap-2"><input id="promo" className="field uppercase" value={promo} onChange={(e) => setPromo(e.target.value)} />
              <button type="button" className="btn-outline !px-4" onClick={() => loadQuote(promo.trim() || undefined)}>Apply</button></div>
            {promoMsg && <p role="status" className={`mt-1 text-xs ${quote?.promo?.valid ? "text-emerald-700" : "text-red-600"}`}>{promoMsg}</p>}
          </div>
        </fieldset>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-[var(--brand)]" /> I agree to the terms, cancellation and refund policy.</label>
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-20">
        <div className="card p-5">
          <h2 className="mb-3 font-bold">Trip summary</h2>
          <p className="font-semibold">{trip.from} → {trip.to}</p>
          <p className="text-sm text-slate-500">{new Date(trip.date).toDateString()} · {trip.departure} · {trip.coachNo}{trip.coachClass ? ` (${trip.coachClass})` : ""}</p>
          <dl className="mt-3 space-y-1 text-sm">
            {board && <div className="flex justify-between gap-3"><dt className="text-slate-500">Boarding</dt><dd className="text-right">{[board.time, board.name].filter(Boolean).join(" · ")}</dd></div>}
            {drop && <div className="flex justify-between gap-3"><dt className="text-slate-500">Dropping</dt><dd className="text-right">{[drop.time, drop.name].filter(Boolean).join(" · ")}</dd></div>}
            <div className="flex justify-between"><dt className="text-slate-500">Seats</dt><dd>{seats.map((s) => s.label).join(", ")}</dd></div>
          </dl>
          <dl className="mt-4 space-y-2 border-t pt-3 text-sm">
            <div className="flex justify-between"><dt>Fare ({seats.length} seat{seats.length > 1 ? "s" : ""})</dt><dd>{taka(fare)}</dd></div>
            {!!quote?.breakdown.serviceCharge && <div className="flex justify-between"><dt>Service charge</dt><dd>{taka(quote.breakdown.serviceCharge)}</dd></div>}
            {!!quote?.breakdown.vat && <div className="flex justify-between"><dt>VAT</dt><dd>{taka(quote.breakdown.vat)}</dd></div>}
            {!!quote?.breakdown.discount && <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd>−{taka(quote.breakdown.discount)}</dd></div>}
            {quote ? quote.lines.map((l) => <div key={l.code} className="flex justify-between"><dt>{l.label}{l.percent ? ` (${l.percent}%)` : ""}</dt><dd>{taka(l.amount)}</dd></div>)
              : feePct > 0 && <div className="flex justify-between"><dt>Payment gateway charge ({feePct}%)</dt><dd>{taka(fee)}</dd></div>}
            <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total payable</dt><dd className="text-accent">{taka(total)}</dd></div>
          </dl>
          <button type="submit" className="btn-accent mt-4 hidden w-full lg:flex" disabled={busy}>{busy ? "Redirecting to gateway…" : `Pay ${taka(total)}`}</button>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white p-3 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div><p className="text-xs text-slate-500">Total · {seats.length} seat(s)</p><p className="text-lg font-extrabold text-accent">{taka(total)}</p></div>
          <button type="submit" className="btn-accent" disabled={busy}>{busy ? "Redirecting…" : "Pay now"}</button>
        </div>
      </div>
    </form>
  );
}
