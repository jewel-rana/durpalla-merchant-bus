import { cache } from "react";
import { redirect } from "next/navigation";
import { isAuthError, pick, sf } from "./storefront";
import type { FeeLine } from "./auth-actions";

export interface Customer { id: string; name: string; phone: string; email: string; avatar?: string }

export const toCustomer = (r: Record<string, unknown>): Customer => ({
  id: String(r.id ?? ""), name: String(r.name ?? "") || "Traveller", phone: String(pick(r, "mobile", "phone") ?? ""),
  email: String(r.email ?? ""), avatar: pick<string>(r, "avatar"),
});

/** GET {tenant}/me, or redirect to /login when there is no valid token for this tenant. */
export const requireMe = cache(async (next = "/account"): Promise<Customer> => {
  try {
    return toCustomer(await sf<Record<string, unknown>>("me", { auth: true }));
  } catch (e) {
    if (isAuthError(e)) redirect(`/login?next=${encodeURIComponent(next)}`);
    throw e;
  }
});

/** Run an authenticated call; on a missing/foreign token go to /login. */
export async function authed<T>(fn: () => Promise<T>, next: string): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (isAuthError(e)) redirect(`/login?next=${encodeURIComponent(next)}`);
    throw e;
  }
}

export type BookingStatus = "upcoming" | "completed" | "cancelled";
export interface BookingSummary { id: string; pnr: string; vertical: string; status: string; travelDate?: string | null; total: number; createdAt?: string | null }
export interface BookingDetail extends BookingSummary {
  details: Record<string, unknown>;
  price: { subtotal: number; serviceCharge: number; vat: number; discount: number; baseTotal: number; gatewayFee: number; total: number; lines: FeeLine[] };
  payment: { mode?: string; gatewayFeeBearer?: string; gatewayFeePercent?: number; baseAmount?: number; gatewayFee?: number; payable?: number; status?: string; gateway?: string };
}

/** GET {tenant}/bookings?status= (the API filters by tab). */
export async function listBookings(status: BookingStatus) {
  return sf<BookingSummary[]>(`bookings?status=${status}`, { auth: true });
}
export async function getBooking(id: string) {
  return sf<BookingDetail>(`bookings/${encodeURIComponent(id)}`, { auth: true });
}
export interface Invoice { pnr: string; pdfUrl?: string; htmlUrl?: string; lines: FeeLine[]; total: number; gatewayFee: number }
export async function getInvoice(id: string) {
  return sf<Invoice>(`bookings/${encodeURIComponent(id)}/invoice`, { auth: true });
}
export interface CancellationQuote { cancellable: boolean; policyLines?: unknown[]; refundPreview?: { refundable?: number; gatewayFee?: number; gatewayFeeRefundable?: boolean } }
export async function getCancellation(id: string) {
  return sf<CancellationQuote>(`bookings/${encodeURIComponent(id)}/cancellation`, { auth: true });
}
export async function getPaymentStatus(id: string) {
  return sf<{ status: string; paid: boolean; amount?: number; transactionId?: string; gateway?: string }>(`payments/${encodeURIComponent(id)}/status`, { auth: true });
}

/** UI tab for an API booking status string. */
export function uiStatus(s: string, travelDate?: string | null): BookingStatus {
  const x = s.toLowerCase();
  if (/(cancel|reject|fail|refund)/.test(x)) return "cancelled";
  if (travelDate && travelDate < new Date().toISOString().slice(0, 10)) return "completed";
  return "upcoming";
}
