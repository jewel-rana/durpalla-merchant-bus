/** UI shapes for the bus site, mapped from the storefront API in lib/transport.ts. */
export interface City { id: string; name: string }
export interface PopularRoute { from: string; to: string; tripsPerDay: number; fromFare: number | null; image: string | null }
export interface SearchParams { from: string; to: string; date: string; returnDate?: string; passengers: number }
export interface Point { id: string; name: string; time: string; address: string }
export interface Trip {
  id: string; vertical: string; operator: string; vehicleName: string; coachNo: string; coachClass: string; isAc: boolean;
  from: string; to: string; date: string; departure: string; arrival: string; duration: string;
  fare: number; seatsLeft: number; totalSeats: number; image: string | null;
  boardingPoints: Point[]; droppingPoints: Point[];
}
export type SeatStatus = "available" | "held" | "booked" | "blocked";
export interface Seat { id: string; label: string; deck: string; row: number; col: number; status: SeatStatus; fare: number; berth: boolean; className?: string }
export interface SeatMap { tripId: string; decks: string[]; cols: number; rows: number; holdTtlMinutes: number; seats: Seat[] }
export interface Passenger { name: string; gender: "male" | "female"; age: number; seat: string; seatLabel: string }
