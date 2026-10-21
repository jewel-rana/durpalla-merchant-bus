"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Trip } from "@/lib/types";
import { taka } from "@/lib/merchant";
import { amenityText } from "@/lib/amenities";

const slots = [
  { k: "morning", l: "Morning (6–12)", t: (h: number) => h >= 6 && h < 12 },
  { k: "afternoon", l: "Afternoon (12–18)", t: (h: number) => h >= 12 && h < 18 },
  { k: "night", l: "Night (18–6)", t: (h: number) => h >= 18 || h < 6 },
];

export function SearchResults({ trips, passengers }: { trips: Trip[]; passengers: number }) {
  const classesList = useMemo(() => [...new Set(trips.map((t) => t.coachClass).filter(Boolean))], [trips]);
  const fareCap = useMemo(() => Math.max(500, Math.ceil(Math.max(0, ...trips.map((t) => t.fare)) / 100) * 100), [trips]);
  const [cls, setCls] = useState<string[]>([]);
  const [slot, setSlot] = useState<string[]>([]);
  const [maxFare, setMaxFare] = useState(Number.POSITIVE_INFINITY);
  const [sort, setSort] = useState("departure");
  const [showFilters, setShowFilters] = useState(false);
  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const list = useMemo(() => {
    const r = trips.filter((t) => {
      const h = Number(t.departure.slice(0, 2));
      return (!cls.length || cls.includes(t.coachClass)) && (!slot.length || slots.some((s) => slot.includes(s.k) && s.t(h))) && t.fare <= maxFare;
    });
    return r.sort((a, b) => (sort === "fare" ? a.fare - b.fare : a.departure.localeCompare(b.departure)));
  }, [trips, cls, slot, maxFare, sort]);

  const filters = (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Coach class</legend>
        {classesList.map((c) => (
          <label key={c} className="flex items-center gap-2 py-1 text-sm"><input type="checkbox" className="accent-[var(--brand)]" checked={cls.includes(c)} onChange={() => toggle(cls, setCls, c)} />{c}</label>
        ))}
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Departure time</legend>
        {slots.map((s) => (
          <label key={s.k} className="flex items-center gap-2 py-1 text-sm"><input type="checkbox" className="accent-[var(--brand)]" checked={slot.includes(s.k)} onChange={() => toggle(slot, setSlot, s.k)} />{s.l}</label>
        ))}
      </fieldset>
      <div>
        <label htmlFor="fare" className="mb-2 block text-sm font-bold">Max fare: {taka(Math.min(maxFare, fareCap))}</label>
        <input id="fare" type="range" min={0} max={fareCap} step={50} value={Math.min(maxFare, fareCap)} onChange={(e) => setMaxFare(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
      </div>
      <button type="button" className="text-sm font-semibold text-brand underline" onClick={() => { setCls([]); setSlot([]); setMaxFare(Number.POSITIVE_INFINITY); }}>Reset filters</button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="card hidden h-fit p-5 lg:block" aria-label="Filters"><h2 className="mb-4 font-bold">Filters</h2>{filters}</aside>
      <section aria-label="Available buses">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600"><b className="text-slate-900">{list.length}</b> buses found</p>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-outline !py-1.5 text-sm lg:hidden" onClick={() => setShowFilters(true)}>Filters</button>
            <label className="sr-only" htmlFor="sort">Sort by</label>
            <select id="sort" className="field !w-auto !py-1.5" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="departure">Earliest departure</option><option value="fare">Lowest fare</option>
            </select>
          </div>
        </div>
        <ul className="space-y-4">
          {list.map((t) => (
            <li key={t.id} className="card p-4 md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="md:w-52">
                  <p className="font-bold">{t.operator}</p>
                  <p className="text-xs text-slate-500">{[t.vehicleName, t.coachNo, t.coachClass].filter(Boolean).join(" · ")}</p>
                  {t.rating && t.rating.count > 0 && <p className="mt-1 text-xs font-semibold text-amber-600">★ {t.rating.rating} <span className="font-normal text-slate-500">({t.rating.count})</span></p>}
                  {t.amenities.length > 0 && <p className="mt-1 text-[11px] text-slate-500">{t.amenities.slice(0, 4).map(amenityText).join(" · ")}</p>}
                </div>
                <div className="flex flex-1 items-center justify-between gap-3 text-center">
                  <div><p className="text-xl font-extrabold whitespace-nowrap">{t.departure}</p><p className="text-xs text-slate-500">{t.from}</p></div>
                  <div className="flex-1 text-xs text-slate-500"><p>{t.duration || "\u00a0"}</p><div className="my-1 h-px bg-slate-300" /><p>Non-stop</p></div>
                  <div><p className="text-xl font-extrabold whitespace-nowrap">{t.arrival || "—"}</p><p className="text-xs text-slate-500">{t.to}</p></div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t pt-3 md:w-48 md:flex-col md:items-end md:border-0 md:pt-0">
                  <div className="md:text-right">
                    <p className="text-xl font-extrabold text-accent">{taka(t.fare)}</p>
                    <p className={`text-xs ${t.seatsLeft < 10 ? "text-red-600" : "text-slate-500"}`}>{t.seatsLeft} seats left</p>
                  </div>
                  <Link href={`/trip/${t.id}/seats?passengers=${passengers}`} className="btn-accent !py-2 text-sm">Select Seats</Link>
                </div>
              </div>
              {t.boardingPoints.length > 0 && <p className="mt-3 border-t pt-3 text-xs text-slate-500">Boarding: {t.boardingPoints.map((p) => p.name).join(" · ")}</p>}
            </li>
          ))}
          {!list.length && <li className="card p-10 text-center text-slate-500">No buses match these filters.</li>}
        </ul>
      </section>
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button className="absolute inset-0 bg-slate-900/50" aria-label="Close filters" onClick={() => setShowFilters(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="mb-4 flex justify-between"><h2 className="font-bold">Filters</h2><button onClick={() => setShowFilters(false)} aria-label="Close">✕</button></div>
            {filters}
            <button className="btn-accent mt-6 w-full" onClick={() => setShowFilters(false)}>Show {list.length} buses</button>
          </div>
        </div>
      )}
    </div>
  );
}
