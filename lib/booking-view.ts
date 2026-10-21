import { pick } from "./storefront-shared";
import { uiStatus, type BookingDetail, type BookingStatus, type BookingSummary } from "./account";

/** Display model for a booking, derived from `GET bookings/{id}` (summary + `details` = Booking::format()). */
export interface BookingView {
  id: string; pnr: string; vertical: string; status: BookingStatus; rawStatus: string;
  title: string; date?: string | null; endDate?: string | null; time?: string;
  units: string[]; // seat / cabin labels, or room type
  people: { name: string; meta?: string; unit?: string }[];
  guests?: { adults: number; children: number };
  total: number; createdAt?: string | null; qr?: string;
  price?: BookingDetail["price"]; payment?: BookingDetail["payment"];
}

const s = (v: unknown) => (v == null ? "" : String(v));

function passengerOf(p: unknown): { name: string; meta?: string } {
  let o = p;
  if (typeof p === "string") { try { o = JSON.parse(p); } catch { return { name: p }; } }
  const name = s(pick(o, "name"));
  const meta = [pick(o, "gender"), pick(o, "age")].filter(Boolean).join(", ");
  return { name, meta: meta || undefined };
}

export function toView(b: BookingSummary | BookingDetail): BookingView {
  const d = ("details" in b ? b.details : {}) as Record<string, unknown>;
  const hotel = pick<Record<string, unknown>>(d, "hotel");
  const items = (pick<unknown[]>(d, "items") ?? []) as Record<string, unknown>[];
  const first = items[0] ?? {};
  const trip = pick<Record<string, unknown>>(first, "trip") ?? {};
  const units = hotel
    ? [s(pick(hotel, "roomType", "room_type"))].filter(Boolean)
    : items.map((i) => s(pick(pick(i, "cabin") ?? {}, "cabinNo", "cabin_no") ?? pick(i, "id"))).filter(Boolean);
  const people = hotel ? [] : items.map((i) => ({ ...passengerOf(pick(i, "passenger", "passengers")), unit: s(pick(pick(i, "cabin") ?? {}, "cabinNo", "cabin_no")) || undefined })).filter((p) => p.name);
  const title = hotel
    ? s(pick(hotel, "name")) || "Hotel stay"
    : s(pick(first, "routeName", "route_name")) || [pick(trip, "startingPoint", "starting_point"), pick(trip, "endingPoint", "ending_point")].filter(Boolean).join(" → ") || `Booking ${b.pnr ?? b.id}`;
  return {
    id: b.id, pnr: b.pnr || b.id, vertical: b.vertical, rawStatus: b.status, status: uiStatus(b.status, b.travelDate),
    title,
    date: hotel ? s(pick(hotel, "checkIn", "check_in")) || b.travelDate : b.travelDate ?? s(pick(first, "tripDate", "trip_date")),
    endDate: hotel ? s(pick(hotel, "checkOut", "check_out")) || null : null,
    time: s(pick(trip, "leavingTime", "leaving_time", "departureTime")) || undefined,
    units, people,
    guests: hotel ? { adults: Number(pick(hotel, "adults") ?? 0), children: Number(pick(hotel, "children") ?? 0) } : undefined,
    total: Number(b.total) || 0, createdAt: b.createdAt ?? s(pick(d, "createdAt", "created_at")),
    qr: s(pick(d, "qr")) || undefined,
    price: "price" in b ? b.price : undefined, payment: "payment" in b ? b.payment : undefined,
  };
}
