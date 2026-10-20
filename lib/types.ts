export type SeatLayout = "2+1" | "2+2" | "sleeper";
export type SeatStatus = "available" | "booked" | "ladies" | "blocked";
export type CoachClass = "Economy (Non-AC)" | "Business (AC)" | "Sleeper";

export interface City { id: string; name: string }
export interface PopularRoute {
  from: string; to: string; duration: string; tripsPerDay: number; fromFare: number; image: string;
}
export interface SearchParams {
  from: string; to: string; date: string; returnDate?: string; passengers: number;
}
export interface Point { id: string; name: string; time: string; address: string }
export interface Trip {
  id: string; operator: string; coachNo: string; coachClass: CoachClass; layout: SeatLayout;
  from: string; to: string; date: string; departure: string; arrival: string; duration: string;
  fare: number; seatsLeft: number; totalSeats: number; amenities: string[]; rating: number;
  boardingPoints: Point[]; droppingPoints: Point[];
}
export interface Seat {
  id: string; label: string; deck: "lower" | "upper"; row: number; col: number;
  status: SeatStatus; fare: number; berth?: boolean;
}
export interface SeatMap { tripId: string; layout: SeatLayout; decks: ("lower" | "upper")[]; cols: number; rows: number; seats: Seat[] }
export interface Passenger { name: string; gender: "male" | "female"; age: number; seat: string }
export type PaymentMethod = "bkash" | "nagad" | "rocket" | "card";
export type BookingStatus = "upcoming" | "completed" | "cancelled";
export interface Booking {
  id: string; pnr: string; trip: Trip; seats: string[]; passengers: Passenger[];
  contact: { phone: string; email: string };
  boardingPoint: Point; droppingPoint: Point;
  fare: number; serviceFee: number; discount: number; total: number;
  paymentMethod: PaymentMethod; status: BookingStatus; createdAt: string;
}
export interface CreateBookingInput {
  tripId: string; seats: string[]; passengers: Passenger[];
  contact: { phone: string; email: string };
  boardingPointId: string; droppingPointId: string; paymentMethod: PaymentMethod;
}
export interface PaymentInit { bookingId: string; gateway: PaymentMethod; redirectUrl: string }
export interface Customer { id: string; name: string; phone: string; email: string; gender: string; dob: string; address: string; nid?: string }
