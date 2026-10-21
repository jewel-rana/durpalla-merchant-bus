import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/storefront";
import { getSeatMap, getTrip } from "@/lib/transport";
import { SeatSelector } from "@/components/SeatSelector";

export const metadata: Metadata = { title: "Select seats" };
export const dynamic = "force-dynamic";

/** GET bus/trips/{id} + GET bus/trips/{id}/seats (live, not cached). */
export default async function SeatsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ passengers?: string }> }) {
  const { id } = await params;
  const { passengers } = await searchParams;
  const [trip, map] = await Promise.all([getTrip(id), getSeatMap(id)]).catch((e) => {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  });
  return <SeatSelector trip={trip} map={map} maxSeats={Math.min(10, Math.max(Number(passengers ?? 4) || 4, 4))} />;
}
