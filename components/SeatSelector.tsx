"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Seat, SeatMap, Trip } from "@/lib/types";
import { customerPaysFee, taka } from "@/lib/merchant";
import { useSite } from "@/lib/site-context";
import { holdSeats } from "@/lib/bus-actions";

const legend = [
  { k: "available", l: "Available", c: "bg-white border-slate-300" },
  { k: "selected", l: "Selected", c: "bg-accent border-accent" },
  { k: "booked", l: "Booked", c: "bg-slate-300 border-slate-300" },
  { k: "held", l: "On hold", c: "bg-amber-100 border-amber-300" },
  { k: "blocked", l: "Blocked", c: "bg-slate-700 border-slate-700" },
  { k: "ladies", l: "Ladies seat", c: "bg-pink-50 border-pink-400" },
];

export function SeatSelector({ trip, map, maxSeats }: { trip: Trip; map: SeatMap; maxSeats: number }) {
  const router = useRouter();
  const site = useSite();
  const [deck, setDeck] = useState<string>(map.decks[0] ?? "lower");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [board, setBoard] = useState(trip.boardingPoints[0]?.id ?? "");
  const [drop, setDrop] = useState(trip.droppingPoints[0]?.id ?? "");
  const [msg, setMsg] = useState("");
  const seats = map.seats.filter((s) => s.deck === deck);
  const fare = selected.reduce((sum, id) => sum + (map.seats.find((s) => s.id === id)?.fare ?? 0), 0);
  // Durpalla gateway charge, only when the merchant passes it to the customer (final amount comes from the API).
  const feePct = customerPaysFee(site) ? site.payments.gatewayFeePercent : 0;
  const fee = Math.round(fare * feePct) / 100;
  const total = fare + fee;
  const labels = selected.map((id) => map.seats.find((x) => x.id === id)?.label ?? id);
  const unavailable = (s: Seat) => s.status !== "available";

  function toggle(s: Seat) {
    if (unavailable(s) && !selected.includes(s.id)) return;
    if (selected.includes(s.id)) return setSelected(selected.filter((x) => x !== s.id));
    if (selected.length >= maxSeats) return setMsg(`You can select up to ${maxSeats} seats.`);
    setMsg("");
    setSelected([...selected, s.id]);
  }

  /** Hold the seats (POST bus/trips/{id}/holds) before checkout so nobody else can take them. */
  async function proceed() {
    setBusy(true); setMsg("");
    const r = await holdSeats(trip.id, selected);
    setBusy(false);
    if (!r.ok) return setMsg(r.message);
    const failed = r.data.errors ?? [];
    if (failed.length) {
      setSelected(selected.filter((id) => !failed.some((e) => e.seatId === id)));
      return setMsg(failed.map((e) => `${map.seats.find((x) => x.id === e.seatId)?.label ?? e.seatId}: ${e.message}`).join(" "));
    }
    const q = new URLSearchParams({ trip: trip.id, seats: selected.join(","), board, drop });
    router.push(`/checkout?${q}`);
  }


  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-32 md:px-8 lg:pb-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500"><Link href="/search" className="hover:text-brand">Search results</Link> › <span className="text-slate-900">Select seats</span></nav>
      <div className="card mb-5 flex flex-col justify-between gap-2 p-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-lg font-bold">{trip.from} → {trip.to}</h1>
          <p className="text-sm text-slate-500">{[trip.operator, trip.coachNo, trip.coachClass].filter(Boolean).join(" · ")} · {new Date(trip.date).toDateString()}</p>
        </div>
        <p className="text-sm"><b>{trip.departure}</b>{trip.arrival && <> → <b>{trip.arrival}</b></>}{trip.duration && ` · ${trip.duration}`}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <section className="card p-5" aria-label="Seat map">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold">Choose seats <span className="text-sm font-normal text-slate-500">({map.seats.filter((x) => x.status === "available").length} available)</span></h2>
            {map.decks.length > 1 && (
              <div role="tablist" aria-label="Deck" className="inline-flex rounded-full bg-slate-100 p-1 text-sm">
                {map.decks.map((d) => (
                  <button key={d} role="tab" aria-selected={deck === d} onClick={() => setDeck(d)} className={`rounded-full px-4 py-1.5 font-medium capitalize ${deck === d ? "bg-brand text-white" : "text-slate-600"}`}>{d} deck</button>
                ))}
              </div>
            )}
          </div>
          <ul className="mb-5 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {legend.map((l) => <li key={l.k} className="flex items-center gap-1.5"><span className={`h-4 w-4 rounded border-2 ${l.c}`} />{l.l}</li>)}
          </ul>
          <div className="mx-auto w-fit rounded-3xl border-2 border-slate-200 bg-slate-50 p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-dashed border-slate-300 pb-3 text-xs text-slate-500">
              <span>{deck === map.decks[0] ? "🚪 Door" : `${deck} deck`}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-slate-400" aria-label="Driver" title="Driver">◎</span>
            </div>
            {!map.seats.length && <p className="p-6 text-center text-sm text-slate-500">The seat plan for this coach is not available.</p>}
            <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${map.cols}, minmax(0, auto))` }}>
              {Array.from({ length: map.rows }).flatMap((_, r) =>
                Array.from({ length: map.cols }).map((__, c) => {
                  const s = seats.find((x) => x.row === r && x.col === c);
                  if (!s) return <span key={`${r}-${c}`} aria-hidden className="w-4 sm:w-6" />;
                  const isSel = selected.includes(s.id);
                  const cls = isSel ? "bg-accent border-accent text-white" : s.status === "booked" ? "bg-slate-300 border-slate-300 text-slate-500 cursor-not-allowed" : s.status === "blocked" ? "bg-slate-700 border-slate-700 text-slate-300 cursor-not-allowed" : s.status === "held" ? "bg-amber-100 border-amber-300 text-amber-700 cursor-not-allowed" : s.isLadies ? "bg-pink-50 border-pink-400 text-pink-700 hover:bg-pink-100" : "bg-white border-slate-300 text-slate-700 hover:border-brand hover:bg-brand-light";
                  return (
                    <button key={s.id} type="button" onClick={() => toggle(s)} disabled={unavailable(s) && !isSel}
                      aria-pressed={isSel} aria-label={`Seat ${s.label}${s.isLadies ? ", ladies seat" : ""}${s.isReserved ? ", reserved" : ""}, ${isSel ? "selected" : s.status}, ${taka(s.fare)}`}
                      title={s.isLadies ? "Ladies seat" : s.isReserved ? "Reserved" : undefined}
                      className={`grid place-items-center rounded-lg border-2 text-xs font-bold transition ${cls} ${s.berth ? "h-20 w-14 sm:w-16" : "h-10 w-10 sm:h-11 sm:w-11"}`}>
                      {s.label}
                    </button>
                  );
                }),
              )}
            </div>
          </div>
          {msg && <p role="status" className="mt-3 text-center text-sm text-red-600">{msg}</p>}
        </section>

        <aside className="space-y-4">
          <div className="card space-y-4 p-5">
            <div>
              <label htmlFor="board" className="mb-1 block text-sm font-bold">Boarding point</label>
              <select id="board" className="field" value={board} onChange={(e) => setBoard(e.target.value)}>
                {trip.boardingPoints.map((p) => <option key={p.id} value={p.id}>{p.time} · {p.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="drop" className="mb-1 block text-sm font-bold">Dropping point</label>
              <select id="drop" className="field" value={drop} onChange={(e) => setDrop(e.target.value)}>
                {trip.droppingPoints.map((p) => <option key={p.id} value={p.id}>{p.time} · {p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="card hidden p-5 lg:block">
            <h2 className="mb-3 font-bold">Fare summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Seats</dt><dd className="font-semibold">{labels.join(", ") || "—"}</dd></div>
              <div className="flex justify-between"><dt>Fare</dt><dd>{taka(fare)}</dd></div>
              {feePct > 0 && <div className="flex justify-between"><dt>Payment gateway charge ({feePct}%)</dt><dd>{taka(fee)}</dd></div>}
              <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total</dt><dd className="text-accent">{taka(total)}</dd></div>
            </dl>
            <button className="btn-accent mt-4 w-full" disabled={!selected.length || busy} onClick={proceed}>{busy ? "Holding seats…" : "Continue to checkout"}</button>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white p-3 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div><p className="text-xs text-slate-500">{selected.length ? `Seats ${labels.join(", ")}` : "No seat selected"}</p><p className="text-lg font-extrabold text-accent">{taka(total)}</p></div>
          <button className="btn-accent" disabled={!selected.length || busy} onClick={proceed}>{busy ? "Holding…" : "Continue"}</button>
        </div>
      </div>
    </div>
  );
}
