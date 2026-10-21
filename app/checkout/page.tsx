import type { Metadata } from "next";
import { requireMe } from "@/lib/account";
import { getSeatMap, getTrip } from "@/lib/transport";
import { CheckoutForm } from "@/components/CheckoutForm";
import { StateMessage } from "@/components/StateMessage";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

/** Booking needs a customer token, so log in first (seat holds follow the guest id to the customer). */
export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const ids = (sp.seats ?? "").split(",").filter(Boolean);
  if (!sp.trip || !ids.length) return <StateMessage title="No seats selected" body="Search for a bus and pick your seats first." action={{ href: "/search", label: "Search buses" }} />;
  const me = await requireMe(`/checkout?${new URLSearchParams(sp as Record<string, string>)}`);
  const [trip, map] = await Promise.all([getTrip(sp.trip), getSeatMap(sp.trip)]);
  const seats = ids.map((id) => { const s = map.seats.find((x) => x.id === id); return { id, label: s?.label ?? id, fare: s?.fare ?? trip.fare }; });
  return <CheckoutForm trip={trip} seats={seats} boardId={sp.board ?? ""} dropId={sp.drop ?? ""} phone={me.phone} />;
}
