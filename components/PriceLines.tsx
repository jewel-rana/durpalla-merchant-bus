import { taka } from "@/lib/merchant";
import type { BookingView } from "@/lib/booking-view";

/** Price block from the API (`price` on GET bookings/{id}); the gateway charge line is only present when the customer bears it. */
export function PriceLines({ b, paidLabel }: { b: BookingView; paidLabel?: string }) {
  const p = b.price;
  if (!p) return <p className="text-sm">Total <b className="text-accent">{taka(b.total)}</b></p>;
  const row = (k: string, v: number, cls = "") => <div key={k} className={`flex justify-between ${cls}`}><dt>{k}</dt><dd>{v < 0 ? `-${taka(-v)}` : taka(v)}</dd></div>;
  return (
    <dl className="space-y-1.5 text-sm">
      {row("Subtotal", p.subtotal)}
      {p.serviceCharge > 0 && row("Service charge", p.serviceCharge)}
      {p.vat > 0 && row("VAT", p.vat)}
      {p.discount > 0 && row("Discount", -p.discount, "text-emerald-700")}
      {(p.lines ?? []).map((l) => row(`${l.label}${l.percent ? ` (${l.percent}%)` : ""}`, l.amount))}
      <div className="flex justify-between border-t pt-2 font-bold"><dt>{paidLabel ?? "Total"}</dt><dd className="text-accent">{taka(p.total)}</dd></div>
    </dl>
  );
}
