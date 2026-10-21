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
  hotelId?: string; canReview?: boolean;
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
  const v = legacyView(b);
  // Typed fields from the API (route / room summaries, passengers[]) win over Booking::format() parsing.
  if (b.route) {
    v.title = [b.route.from, b.route.to].every(Boolean) ? `${b.route.from} → ${b.route.to}` : b.route.name || v.title;
    v.date = b.route.date || v.date;
    if (b.route.departureAt) v.time = new Date(b.route.departureAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" });
    if (b.route.seats.length) v.units = b.route.seats;
  }
  if (b.room) {
    v.title = b.room.hotelName || v.title;
    v.date = b.room.checkIn || v.date; v.endDate = b.room.checkOut || v.endDate;
    v.units = [b.room.roomName ? `${b.room.rooms > 1 ? `${b.room.rooms} × ` : ""}${b.room.roomName}` : ""].filter(Boolean);
    v.guests = { adults: b.room.adults, children: b.room.children };
    v.hotelId = b.room.hotelId;
  }
  if ("passengers" in b && b.passengers?.length) {
    v.people = b.passengers.filter((p) => p.name).map((p) => ({ name: s(p.name), meta: [p.gender, p.age].filter(Boolean).join(", ") || undefined, unit: p.seat ?? undefined }));
  }
  if ("canReview" in b) v.canReview = Boolean(b.canReview);
  return v;
}

function legacyView(b: BookingSummary | BookingDetail): BookingView {
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
