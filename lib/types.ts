/** UI shapes for the bus site, mapped from the storefront API in lib/transport.ts. */
export interface City { id: string; name: string }
export interface PopularRoute { from: string; to: string; fromId?: string; toId?: string; tripsPerDay: number; fromFare: number | null; image: string | null }
export interface SearchParams { from: string; to: string; date: string; returnDate?: string; passengers: number }
export interface Point { id: string; name: string; time: string; address: string }
export interface Trip {
  id: string; vertical: string; operator: string; vehicleName: string; coachNo: string; coachClass: string; isAc: boolean;
  from: string; to: string; date: string; departure: string; arrival: string; duration: string;
  fare: number; seatsLeft: number; totalSeats: number; image: string | null; images: string[];
  amenities: string[]; rating: { rating: number; count: number } | null;
  boardingPoints: Point[]; droppingPoints: Point[];
}
export interface FleetVehicle { id: string; name: string; registrationNo?: string | null; isAc: boolean; seats?: number | null; floors: number; amenities: string[]; images: string[]; rating: { rating: number; count: number } | null }
export interface SeatClass { id: string; name: string; isAc: boolean; capacity: number; fromFare: number; toFare: number }
export interface Review { id: string; author?: string | null; rating: number; text?: string | null; date?: string | null }
export interface TransportContent {
  fleet: FleetVehicle[]; amenities: { code: string; vehicles: number }[]; seatClasses: SeatClass[];
  stats: { vehicles: number; routes: number; dailyTrips: number; travellers: number; rating: number | null; reviews: number };
  reviews: Review[];
}
export interface TripQuote {
  breakdown: { fare: number; serviceCharge: number; vat: number; discount: number; subtotal: number; gatewayFee: number; total: number };
  lines: { code: string; label: string; percent?: number; amount: number }[];
  promo: { code: string; valid: boolean; discount: number; message?: string } | null;
}
export type SeatStatus = "available" | "held" | "booked" | "blocked";
export interface Seat { id: string; label: string; deck: string; row: number; col: number; status: SeatStatus; fare: number; berth: boolean; className?: string; isLadies: boolean; isReserved: boolean }
export interface SeatMap { tripId: string; decks: string[]; cols: number; rows: number; holdTtlMinutes: number; seats: Seat[] }
export interface Passenger { name: string; gender: "male" | "female"; age: number; seat: string; seatLabel: string }
