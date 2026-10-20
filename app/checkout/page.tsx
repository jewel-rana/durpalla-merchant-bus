import type { Metadata } from "next";
import { api } from "@/lib/api";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const trip = await api.getTrip(sp.trip ?? "");
  const seats = (sp.seats ?? "A1").split(",").filter(Boolean);
  return <CheckoutForm trip={trip} seats={seats} boardId={sp.board ?? "bp1"} dropId={sp.drop ?? "dp1"} />;
}
