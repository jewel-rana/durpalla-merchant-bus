"use server";
import { cookies } from "next/headers";
import { ApiError, TOKEN_COOKIE, sf } from "./storefront";
import type { Customer } from "./account";
import { toCustomer } from "./account";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; code: string; message: string };

export async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, code: e.code, message: e.message };
    console.error(e);
    return { ok: false, code: "UNKNOWN", message: "Something went wrong. Please try again." };
  }
}

/** POST {tenant}/auth/otp/send */
export async function requestOtp(phone: string) {
  return run(() => sf<unknown>("auth/otp/send", { method: "POST", body: { phone } }).then(() => undefined));
}

/** POST {tenant}/auth/otp/verify → tenant-scoped token stored in an httpOnly cookie (per host = per tenant). */
export async function verifyOtp(phone: string, code: string) {
  return run(async () => {
    const r = await sf<{ token: string; isNew?: boolean }>("auth/otp/verify", { method: "POST", body: { phone, code, deviceName: "web" } });
    (await cookies()).set(TOKEN_COOKIE, r.token, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30,
    });
    return { isNew: Boolean(r.isNew) };
  });
}

/** POST {tenant}/auth/logout (best effort) and clear the cookie. */
export async function logout() {
  await sf("auth/logout", { method: "POST", auth: true }).catch(() => undefined);
  (await cookies()).delete(TOKEN_COOKIE);
}

/** PATCH {tenant}/me (name, email). */
export async function updateProfile(p: Pick<Customer, "name" | "email" | "gender" | "dob" | "address" | "city" | "nidNo">) {
  return run(async () => toCustomer(await sf<Record<string, unknown>>("me", { method: "PATCH", auth: true, body: {
    name: p.name, email: p.email || null, gender: p.gender || null, dob: p.dob || null,
    address: p.address || null, city: p.city || null, nidNo: p.nidNo || null,
  } })));
}

/** 🔒 Review: hotel stays → POST hotel/properties/{hotelId}/reviews; bus/launch → POST bookings/{id}/review. */
export async function submitReview(input: { bookingId: string; hotelId?: string; rating: number; text: string }) {
  const path = input.hotelId ? `hotel/properties/${encodeURIComponent(input.hotelId)}/reviews` : `bookings/${encodeURIComponent(input.bookingId)}/review`;
  return run(() => sf<{ id: string; rating: number }>(path, { method: "POST", auth: true, body: { rating: input.rating, text: input.text } }));
}

export interface PaymentInit { bookingId: string; redirectUrl: string; amount?: number; price?: { lines?: FeeLine[]; payable?: number } }
export interface FeeLine { code: string; label: string; percent?: number; amount: number }

/** POST {tenant}/payments/initiate {bookingId, method} → gateway redirectUrl. */
export async function initiatePayment(bookingId: string, method: string) {
  return run(() => sf<PaymentInit>("payments/initiate", { method: "POST", auth: true, body: { bookingId, method } }));
}

/** POST {tenant}/bookings/{id}/cancel */
export async function cancelBooking(id: string, reason?: string) {
  return run(() => sf<{ status: string }>(`bookings/${encodeURIComponent(id)}/cancel`, { method: "POST", auth: true, body: { reason } }));
}

/** POST {tenant}/promos/validate */
export async function validatePromo(code: string, vertical: string, amount: number) {
  return run(() => sf<{ code: string; valid: boolean; discount: number; message?: string }>("promos/validate", { method: "POST", body: { code, vertical, amount } }));
}
