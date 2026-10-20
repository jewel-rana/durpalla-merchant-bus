import type { Metadata } from "next";
import { api } from "@/lib/api";
import { SeatSelector } from "@/components/SeatSelector";

export const metadata: Metadata = { title: "Select seats" };

export default async function SeatsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ passengers?: string }> }) {
  const { id } = await params;
  const { passengers } = await searchParams;
  const [trip, map] = await Promise.all([api.getTrip(id), api.getSeatMap(id)]);
  return <SeatSelector trip={trip} map={map} maxSeats={Math.max(Number(passengers ?? 4), 4)} />;
}
