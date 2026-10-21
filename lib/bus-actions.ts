"use server";
import { sf } from "./storefront";
import { run } from "./auth-actions";
import type { TripQuote } from "./types";

/** POST bus/trips/{trip}/holds {seatIds} — works for guests (X-Guest-Id) and customers. */
export async function holdSeats(tripId: string, seatIds: string[]) {
  return run(() => sf<{ seatIds: string[]; expiresAt?: string; ttlSeconds?: number; errors?: { seatId: string; message: string }[] }>(
    `bus/trips/${encodeURIComponent(tripId)}/holds`, { method: "POST", body: { seatIds } },
  ));
}

/** DELETE bus/trips/{trip}/holds/{seat} */
export async function releaseSeat(tripId: string, seatId: string) {
  return run(() => sf(`bus/trips/${encodeURIComponent(tripId)}/holds/${encodeURIComponent(seatId)}`, { method: "DELETE" }).then(() => undefined));
}

export interface BusBookingInput {
  tripId: string; seatIds: string[]; boardingPoint?: string; promoCode?: string;
  passengers: { name: string; mobile: string; gender: string; age: number }[];
}

/** 🔒 POST bookings {vertical:"bus", tripId, seatIds, passengers, boardingPoint, promoCode}. */
export async function createBusBooking(input: BusBookingInput) {
  return run(() => sf<{ id: string; pnr?: string; total?: number; price?: { total: number; lines: { label: string; amount: number; percent?: number }[] } }>(
    "bookings", { method: "POST", auth: true, body: { vertical: "bus", platform: "web", ...input } },
  ));
}

/** POST bus/trips/{trip}/quote {seatIds, promoCode}: the same totals as the booking, plus the gateway-fee line. Guests allowed. */
export async function quoteTrip(tripId: string, seatIds: string[], promoCode?: string) {
  return run(() => sf<TripQuote>(`bus/trips/${encodeURIComponent(tripId)}/quote`, { method: "POST", body: { seatIds, promoCode: promoCode || undefined } }));
}
