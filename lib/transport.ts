/** Bus endpoints: `{tenant}/bus/...` (cities, search, trips/{id}, seats, points). */
import { sf } from "./storefront";
import { pick } from "./storefront-shared";
import type { City, Point, PopularRoute, SeatMap, SearchParams, Trip } from "./types";

export const VERTICAL = "bus";
const s = (v: unknown) => (v == null ? "" : String(v));

const hhmm = (v: unknown) => {
  const x = s(v);
  const m = /(\d{1,2}):(\d{2})/.exec(x);
  if (!m) return x;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
};

function duration(a?: string, b?: string) {
  if (!a || !b) return "";
  const ms = new Date(b).getTime() - new Date(a).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return "";
  const m = Math.round(ms / 60000);
  return `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}`;
}

const toPoint = (p: unknown): Point => ({
  id: s(pick(p, "id")), name: s(pick(p, "name")),
  time: hhmm(pick(p, "time", "arrivalTime", "arrival_time", "departureTime")), address: s(pick(p, "address", "location")),
});

export function toTrip(t: Record<string, unknown>): Trip {
  const dep = s(t.departureAt), arr = s(t.arrivalAt);
  return {
    id: s(t.id), vertical: s(t.vertical) || VERTICAL, operator: s(t.operator), vehicleName: s(t.vehicleName),
    coachNo: s(t.coachNo), coachClass: s(t.coachClass) || (t.isAc ? "AC" : "Non-AC"), isAc: Boolean(t.isAc),
    from: s(t.from), to: s(t.to), date: s(t.date), departure: hhmm(t.departure || dep), arrival: arr ? hhmm(arr) : "",
    duration: duration(dep, arr), fare: Number(t.fare) || 0, seatsLeft: Number(t.seatsLeft) || 0, totalSeats: Number(t.totalSeats) || 0,
    image: s(t.image) || null,
    boardingPoints: ((t.boardingPoints as unknown[]) ?? []).map(toPoint),
    droppingPoints: ((t.droppingPoints as unknown[]) ?? []).map(toPoint),
  };
}

export const getCities = () => sf<City[]>(`${VERTICAL}/cities`, { revalidate: 3600 });

export async function searchTrips(q: SearchParams): Promise<Trip[]> {
  const qs = new URLSearchParams({ from: q.from, to: q.to, date: q.date });
  return (await sf<Record<string, unknown>[]>(`${VERTICAL}/search?${qs}`, { revalidate: 60 })).map(toTrip);
}

export async function getTrip(id: string): Promise<Trip> {
  return toTrip(await sf<Record<string, unknown>>(`${VERTICAL}/trips/${encodeURIComponent(id)}`, { revalidate: 60 }));
}

/** Live seat status: never cached. Rows/cols are normalised to 0-based for the grid. */
export async function getSeatMap(id: string): Promise<SeatMap> {
  const m = await sf<Record<string, unknown>>(`${VERTICAL}/trips/${encodeURIComponent(id)}/seats`);
  const raw = ((m.seats as Record<string, unknown>[]) ?? []);
  const minR = Math.min(...raw.map((x) => Number(x.row) || 0), Infinity);
  const minC = Math.min(...raw.map((x) => Number(x.col) || 0), Infinity);
  const seats = raw.map((x) => ({
    id: s(x.id), label: s(x.label), deck: s(x.deck) || "lower",
    row: (Number(x.row) || 0) - (Number.isFinite(minR) ? minR : 0), col: (Number(x.col) || 0) - (Number.isFinite(minC) ? minC : 0),
    status: (["available", "held", "booked", "blocked"].includes(s(x.status)) ? s(x.status) : "blocked") as SeatMap["seats"][number]["status"],
    fare: Number(x.fare) || 0, berth: s(x.type) === "cabin" || /sleep|berth|bed/i.test(s(x.className)), className: s(x.className) || undefined,
  }));
  return {
    tripId: s(m.tripId) || id,
    decks: ((m.decks as string[]) ?? []).length ? (m.decks as string[]) : ["lower"],
    rows: seats.length ? Math.max(...seats.map((x) => x.row)) + 1 : 0,
    cols: seats.length ? Math.max(...seats.map((x) => x.col)) + 1 : 0,
    holdTtlMinutes: Number(m.holdTtlMinutes) || 3,
    seats,
  };
}

/** `home.popularRoutes` for bus tenants. */
export function popularRoutes(home: Record<string, unknown>): PopularRoute[] {
  return ((home.popularRoutes as Record<string, unknown>[]) ?? []).filter((r) => r.from && r.to).map((r) => ({
    from: s(r.from), to: s(r.to), tripsPerDay: Number(r.tripsPerDay) || 0,
    fromFare: r.fromFare == null ? null : Number(r.fromFare), image: s(r.image) || null,
  }));
}
