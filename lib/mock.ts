import type { Booking, City, Customer, Point, PopularRoute, Seat, SeatLayout, SeatMap, Trip } from "./types";

export const cities: City[] = ["Dhaka", "Chattogram", "Cox's Bazar", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Bogura", "Kushtia"].map(
  (n) => ({ id: n.toLowerCase().replace(/[^a-z]/g, ""), name: n }),
);

export const popularRoutes: PopularRoute[] = [
  { from: "Dhaka", to: "Cox's Bazar", duration: "10h", tripsPerDay: 8, fromFare: 1200, image: "/img/beach.jpg" },
  { from: "Dhaka", to: "Chattogram", duration: "6h", tripsPerDay: 14, fromFare: 800, image: "/img/ctg.jpg" },
  { from: "Dhaka", to: "Sylhet", duration: "5h", tripsPerDay: 10, fromFare: 700, image: "/img/tea.jpg" },
  { from: "Chattogram", to: "Cox's Bazar", duration: "4h", tripsPerDay: 6, fromFare: 500, image: "/img/sea.jpg" },
];

const bp = (from: string): Point[] => [
  { id: "bp1", name: `${from} - Kalabagan`, time: "", address: "Kalabagan counter, Mirpur Rd" },
  { id: "bp2", name: `${from} - Fakirapool`, time: "", address: "Fakirapool counter" },
  { id: "bp3", name: `${from} - Sayedabad`, time: "", address: "Sayedabad terminal" },
];
const dp = (to: string): Point[] => [
  { id: "dp1", name: `${to} - Main Terminal`, time: "", address: "Central bus terminal" },
  { id: "dp2", name: `${to} - City Gate`, time: "", address: "City gate counter" },
];
const withTimes = (pts: Point[], start: string) => {
  const [h, m] = start.split(":").map(Number);
  return pts.map((p, i) => {
    const t = h * 60 + m + i * 20;
    return { ...p, time: `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}` };
  });
};

const tripTemplates: Array<Pick<Trip, "coachClass" | "layout" | "departure" | "arrival" | "fare" | "totalSeats" | "amenities" | "rating">> = [
  { coachClass: "Business (AC)", layout: "2+1", departure: "07:30", arrival: "17:00", fare: 1200, totalSeats: 30, amenities: ["AC", "Wi-Fi", "USB", "Snacks", "Blanket"], rating: 4.7 },
  { coachClass: "Economy (Non-AC)", layout: "2+2", departure: "09:00", arrival: "19:30", fare: 700, totalSeats: 40, amenities: ["Water", "Reclining"], rating: 4.2 },
  { coachClass: "Business (AC)", layout: "2+1", departure: "13:15", arrival: "22:45", fare: 1400, totalSeats: 30, amenities: ["AC", "Wi-Fi", "USB", "GPS"], rating: 4.6 },
  { coachClass: "Sleeper", layout: "sleeper", departure: "22:30", arrival: "07:15", fare: 2500, totalSeats: 18, amenities: ["AC", "Flat bed", "Wi-Fi", "Blanket", "CCTV"], rating: 4.9 },
  { coachClass: "Economy (Non-AC)", layout: "2+2", departure: "23:45", arrival: "09:30", fare: 800, totalSeats: 40, amenities: ["Water", "Reclining", "GPS"], rating: 4.1 },
];

const durationOf = (a: string, b: string) => {
  const [h1, m1] = a.split(":").map(Number);
  const [h2, m2] = b.split(":").map(Number);
  let d = h2 * 60 + m2 - (h1 * 60 + m1);
  if (d < 0) d += 1440;
  return `${Math.floor(d / 60)}h ${d % 60 ? `${d % 60}m` : ""}`.trim();
};

export function makeTrips(from = "Dhaka", to = "Cox's Bazar", date = "2026-10-24"): Trip[] {
  return tripTemplates.map((t, i) => ({
    ...t,
    id: `GL${101 + i}-${date.replaceAll("-", "")}-${from.replace(/[^A-Za-z]/g, "")}-${to.replace(/[^A-Za-z]/g, "")}`,
    operator: "Green Line Paribahan",
    coachNo: `GL-${101 + i}`,
    from, to, date,
    duration: durationOf(t.departure, t.arrival),
    seatsLeft: Math.max(3, t.totalSeats - 7 - i * 3),
    boardingPoints: withTimes(bp(from), t.departure),
    droppingPoints: withTimes(dp(to), t.arrival),
  }));
}

/** Trip ids encode route/date so detail pages work without a DB. */
export function tripById(id: string): Trip {
  const m = id.match(/^GL(\d+)-(\d{8})-(.+)-(.+)$/);
  const idx = m ? Number(m[1]) - 101 : 0;
  const date = m ? `${m[2].slice(0, 4)}-${m[2].slice(4, 6)}-${m[2].slice(6)}` : "2026-10-24";
  const unslug = (s: string) => cities.find((c) => c.name.replace(/[^A-Za-z]/g, "") === s.replace(/[^A-Za-z]/g, ""))?.name ?? s;
  const from = m ? unslug(m[3]) : "Dhaka";
  const to = m ? unslug(m[4]) : "Cox's Bazar";
  const trips = makeTrips(from, to, date);
  return trips[Math.min(Math.max(idx, 0), trips.length - 1)];
}

const pseudo = (n: number) => ((n * 9301 + 49297) % 233280) / 233280;

export function makeSeatMap(trip: Trip): SeatMap {
  const layout: SeatLayout = trip.layout;
  const seats: Seat[] = [];
  const status = (k: number, ladiesOk: boolean): Seat["status"] => {
    const r = pseudo(k + trip.departure.length * 7 + Number(trip.coachNo.slice(-1)));
    if (r < 0.25) return "booked";
    if (r < 0.3) return "blocked";
    if (ladiesOk && r < 0.38) return "ladies";
    return "available";
  };
  if (layout === "sleeper") {
    // 1 + 1 berths, two decks, 5 rows each -> 20 (18 sold)
    (["lower", "upper"] as const).forEach((deck, d) => {
      for (let r = 0; r < 5; r++) {
        [0, 2].forEach((c, ci) => {
          const label = `${d ? "U" : "L"}${r * 2 + ci + 1}`;
          seats.push({ id: label, label, deck, row: r, col: c, berth: true, status: status(seats.length, true), fare: trip.fare + (d ? -200 : 0) });
        });
      }
    });
    return { tripId: trip.id, layout, decks: ["lower", "upper"], cols: 3, rows: 5, seats };
  }
  const cols = layout === "2+1" ? [0, 1, 3] : [0, 1, 3, 4];
  const rows = Math.ceil(trip.totalSeats / cols.length);
  const letters = "ABCDEFGHIJKLMN";
  for (let r = 0; r < rows; r++) {
    cols.forEach((c, ci) => {
      const label = `${letters[r]}${ci + 1}`;
      seats.push({ id: label, label, deck: "lower", row: r, col: c, status: status(seats.length, r < 3), fare: trip.fare });
    });
  }
  return { tripId: trip.id, layout, decks: ["lower"], cols: cols.length + 1, rows, seats };
}

export const customer: Customer = {
  id: "c1", name: "Rahim Uddin", phone: "+8801711000000", email: "rahim@example.com",
  gender: "Male", dob: "1992-04-12", address: "House 12, Road 5, Dhanmondi, Dhaka",
};

function mkBooking(i: number, from: string, to: string, date: string, status: Booking["status"], seats: string[]): Booking {
  const trip = makeTrips(from, to, date)[i % 5];
  const fare = trip.fare * seats.length;
  return {
    id: `DB${260000 + i * 137}`, pnr: `GLP${7310 + i * 19}`, trip, seats,
    passengers: seats.map((s, k) => ({ name: k ? "Ayesha Rahman" : customer.name, gender: k ? "female" : "male", age: k ? 28 : 34, seat: s })),
    contact: { phone: customer.phone, email: customer.email },
    boardingPoint: trip.boardingPoints[0], droppingPoint: trip.droppingPoints[0],
    fare, serviceFee: 30 * seats.length, discount: i === 0 ? 100 : 0,
    total: fare + 30 * seats.length - (i === 0 ? 100 : 0),
    paymentMethod: (["bkash", "nagad", "card", "rocket"] as const)[i % 4], status,
    createdAt: "2026-10-18T10:15:00+06:00",
  };
}

export const bookings: Booking[] = [
  mkBooking(0, "Dhaka", "Cox's Bazar", "2026-10-24", "upcoming", ["A1", "A2"]),
  mkBooking(1, "Dhaka", "Sylhet", "2026-11-02", "upcoming", ["C3"]),
  mkBooking(2, "Dhaka", "Chattogram", "2026-09-12", "completed", ["B1"]),
  mkBooking(3, "Chattogram", "Cox's Bazar", "2026-08-21", "completed", ["L3", "L4"]),
  mkBooking(4, "Dhaka", "Rajshahi", "2026-07-30", "cancelled", ["D2"]),
];
