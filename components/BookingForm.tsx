"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cities } from "@/lib/mock";

export interface BookingFormValues { from: string; to: string; date: string; returnDate?: string; passengers: number }

export function BookingForm({ initial, compact = false }: { initial?: Partial<BookingFormValues>; compact?: boolean }) {
  const router = useRouter();
  const [round, setRound] = useState(Boolean(initial?.returnDate));
  const [from, setFrom] = useState(initial?.from ?? "Dhaka");
  const [to, setTo] = useState(initial?.to ?? "Cox's Bazar");
  const [date, setDate] = useState(initial?.date ?? "2026-10-24");
  const [ret, setRet] = useState(initial?.returnDate ?? "");
  const [pax, setPax] = useState(initial?.passengers ?? 1);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (from === to) return setError("From and To must be different cities.");
    if (round && !ret) return setError("Please choose a return date.");
    setError("");
    const q = new URLSearchParams({ from, to, date, passengers: String(pax) });
    if (round && ret) q.set("returnDate", ret);
    router.push(`/search?${q}`);
  }

  const cityList = (
    <datalist id="city-list">{cities.map((c) => <option key={c.id} value={c.name} />)}</datalist>
  );

  return (
    <form onSubmit={submit} className={compact ? "" : "card border-t-4 border-t-accent p-5 md:p-6"} aria-label="Search bus tickets">
      {!compact && <h2 className="mb-3 text-lg font-bold text-brand">Book your bus ticket</h2>}
      <div className="mb-4 inline-flex rounded-full bg-slate-100 p-1 text-sm" role="radiogroup" aria-label="Trip type">
        {["One way", "Round trip"].map((t, i) => (
          <button key={t} type="button" role="radio" aria-checked={round === Boolean(i)} onClick={() => setRound(Boolean(i))}
            className={`rounded-full px-4 py-1.5 font-medium ${round === Boolean(i) ? "bg-brand text-white" : "text-slate-600"}`}>{t}</button>
        ))}
      </div>
      {cityList}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr_1fr_1fr_0.7fr_auto] md:items-end">
        <div>
          <label className="label" htmlFor="from">From</label>
          <input id="from" list="city-list" className="field font-semibold" value={from} onChange={(e) => setFrom(e.target.value)} required />
        </div>
        <button type="button" aria-label="Swap From and To" onClick={() => { setFrom(to); setTo(from); }}
          className="mx-auto -my-2 grid h-9 w-9 rotate-90 place-items-center rounded-full border border-slate-200 bg-white text-brand shadow-sm hover:bg-brand-light md:my-0 md:mb-1 md:rotate-0">⇄</button>
        <div>
          <label className="label" htmlFor="to">To</label>
          <input id="to" list="city-list" className="field font-semibold" value={to} onChange={(e) => setTo(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3 md:contents">
          <div>
            <label className="label" htmlFor="date">Journey date</label>
            <input id="date" type="date" className="field" value={date} min="2026-10-20" onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="ret">Return {round ? "" : "(optional)"}</label>
            <input id="ret" type="date" className="field disabled:bg-slate-50" value={ret} min={date} disabled={!round} onChange={(e) => setRet(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="pax">Passengers</label>
          <select id="pax" className="field" value={pax} onChange={(e) => setPax(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-accent h-[42px] w-full md:w-auto">Search Buses</button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  );
}
