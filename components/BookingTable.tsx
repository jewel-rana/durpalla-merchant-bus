import Link from "next/link";
import type { BookingView } from "@/lib/booking-view";
import { taka } from "@/lib/merchant";
import { copy } from "@/lib/copy";
import { StatusBadge, fmtDate } from "./ui";

/** Table on desktop, stacked cards on mobile. */
export function BookingTable({ items }: { items: BookingView[] }) {
  if (!items.length) return <p className="card p-8 text-center text-slate-500">No bookings here yet.</p>;
  const when = (b: BookingView) => (b.date ? `${fmtDate(b.date)}${b.endDate ? ` – ${fmtDate(b.endDate)}` : b.time ? ` · ${b.time}` : ""}` : "—");
  return (
    <>
      <div className="card hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">{copy.ref}</th><th className="px-4 py-3">{copy.titleCol}</th><th className="px-4 py-3">{copy.dateCol}</th><th className="px-4 py-3">{copy.unitsCol}</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-3 font-semibold">{b.pnr}</td>
                <td className="px-4 py-3">{b.title}</td>
                <td className="px-4 py-3">{when(b)}</td>
                <td className="px-4 py-3">{b.units.join(", ") || "—"}</td>
                <td className="px-4 py-3 font-semibold">{taka(b.total)}</td>
                <td className="px-4 py-3"><StatusBadge s={b.status} /></td>
                <td className="px-4 py-3 text-right"><Link href={`/account/bookings/${b.id}`} className="font-semibold text-brand hover:underline">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {items.map((b) => (
          <li key={b.id}>
            <Link href={`/account/bookings/${b.id}`} className="card block p-4">
              <div className="flex items-center justify-between"><span className="text-xs text-slate-500">{copy.ref} {b.pnr}</span><StatusBadge s={b.status} /></div>
              <p className="mt-1 font-bold">{b.title}</p>
              <p className="text-sm text-slate-500">{when(b)}{b.units.length ? ` · ${b.units.join(", ")}` : ""}</p>
              <p className="mt-2 font-bold text-accent">{taka(b.total)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
