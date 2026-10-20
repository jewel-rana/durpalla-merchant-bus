/**
 * Typed client for the Durpalla booking API.
 * Set NEXT_PUBLIC_API_BASE_URL (and NEXT_PUBLIC_USE_MOCK=false) to talk to the
 * real backend; by default a local mock implementation is used so the site
 * runs standalone.
 */
import type {
  Booking, City, CreateBookingInput, Customer, PaymentInit, PaymentMethod, PopularRoute, SearchParams, SeatMap, Trip,
} from "./types";
import * as mock from "./mock";
import { DEFAULT_MERCHANT_ID } from "./merchant";

export interface BookingApi {
  getCities(): Promise<City[]>;
  getPopularRoutes(): Promise<PopularRoute[]>;
  searchTrips(q: SearchParams): Promise<Trip[]>;
  getTrip(id: string): Promise<Trip>;
  getSeatMap(tripId: string): Promise<SeatMap>;
  createBooking(input: CreateBookingInput): Promise<Booking>;
  initiatePayment(bookingId: string, method: PaymentMethod): Promise<PaymentInit>;
  getBooking(id: string): Promise<Booking | undefined>;
  listBookings(): Promise<Booking[]>;
  cancelBooking(id: string): Promise<Booking | undefined>;
  getProfile(): Promise<Customer>;
  updateProfile(p: Partial<Customer>): Promise<Customer>;
  requestOtp(phone: string): Promise<{ ok: boolean }>;
  verifyOtp(phone: string, code: string): Promise<{ token: string }>;
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false" || !BASE;

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("dp_token") : null;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Merchant-Id": DEFAULT_MERCHANT_ID,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const httpApi: BookingApi = {
  getCities: () => http("/v1/cities"),
  getPopularRoutes: () => http("/v1/routes/popular"),
  searchTrips: (q) => http(`/v1/trips?${new URLSearchParams({ ...q, passengers: String(q.passengers) } as Record<string, string>)}`),
  getTrip: (id) => http(`/v1/trips/${id}`),
  getSeatMap: (id) => http(`/v1/trips/${id}/seats`),
  createBooking: (input) => http("/v1/bookings", { method: "POST", body: JSON.stringify(input) }),
  initiatePayment: (bookingId, method) => http(`/v1/bookings/${bookingId}/payments`, { method: "POST", body: JSON.stringify({ method }) }),
  getBooking: (id) => http(`/v1/bookings/${id}`),
  listBookings: () => http("/v1/me/bookings"),
  cancelBooking: (id) => http(`/v1/bookings/${id}/cancel`, { method: "POST" }),
  getProfile: () => http("/v1/me"),
  updateProfile: (p) => http("/v1/me", { method: "PATCH", body: JSON.stringify(p) }),
  requestOtp: (phone) => http("/v1/auth/otp", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone, code) => http("/v1/auth/otp/verify", { method: "POST", body: JSON.stringify({ phone, code }) }),
};

const delay = <T,>(v: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(v), ms));
const created = new Map<string, Booking>();

export const mockApi: BookingApi = {
  getCities: () => delay(mock.cities),
  getPopularRoutes: () => delay(mock.popularRoutes),
  searchTrips: (q) => delay(mock.makeTrips(q.from, q.to, q.date)),
  getTrip: (id) => delay(mock.tripById(id)),
  getSeatMap: (id) => delay(mock.makeSeatMap(mock.tripById(id))),
  async createBooking(input) {
    const trip = mock.tripById(input.tripId);
    const fare = trip.fare * input.seats.length;
    const b: Booking = {
      id: `DB${Math.floor(100000 + Math.random() * 899999)}`, pnr: `GLP${Math.floor(1000 + Math.random() * 8999)}`,
      trip, seats: input.seats, passengers: input.passengers, contact: input.contact,
      boardingPoint: trip.boardingPoints.find((p) => p.id === input.boardingPointId) ?? trip.boardingPoints[0],
      droppingPoint: trip.droppingPoints.find((p) => p.id === input.droppingPointId) ?? trip.droppingPoints[0],
      fare, serviceFee: 30 * input.seats.length, discount: 0, total: fare + 30 * input.seats.length,
      paymentMethod: input.paymentMethod, status: "upcoming", createdAt: new Date().toISOString(),
    };
    created.set(b.id, b);
    if (typeof window !== "undefined") sessionStorage.setItem(`booking:${b.id}`, JSON.stringify(b));
    return delay(b);
  },
  // Stub: the real API returns the bKash/Nagad/SSL gateway URL; we jump straight to confirmation.
  initiatePayment: (bookingId, method) =>
    delay({ bookingId, gateway: method, redirectUrl: `/booking/${bookingId}/confirmation?paid=1&gw=${method}` }, 400),
  async getBooking(id) {
    if (created.has(id)) return created.get(id);
    if (typeof window !== "undefined") {
      const s = sessionStorage.getItem(`booking:${id}`);
      if (s) return JSON.parse(s) as Booking;
    }
    return delay(mock.bookings.find((b) => b.id === id) ?? { ...mock.bookings[0], id });
  },
  listBookings: () => delay(mock.bookings),
  cancelBooking: async (id) => {
    const b = mock.bookings.find((x) => x.id === id);
    return delay(b ? { ...b, status: "cancelled" as const } : undefined);
  },
  getProfile: () => delay(mock.customer),
  updateProfile: (p) => delay({ ...mock.customer, ...p }),
  requestOtp: () => delay({ ok: true }),
  verifyOtp: (phone) => delay({ token: `mock-${phone}` }),
};

export const api: BookingApi = USE_MOCK ? mockApi : httpApi;
