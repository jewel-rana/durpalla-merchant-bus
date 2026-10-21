/**
 * Server-side client for the Durpalla storefront API
 * (`/api/v1/merchant/storefront/{tenant}/...`, see durpalla-apigw docs/STOREFRONT_API.md).
 *
 * All calls run on the Next.js server (server components, server actions, proxy),
 * so no CORS and no token in browser JS. Responses are `{success, message, data}`;
 * this unwraps `data` and throws `ApiError` with the API `code` on failure.
 */
import { cookies, headers } from "next/headers";
import { cache } from "react";

export const API_BASE_URL = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
export const STOREFRONT_PATH = "/api/v1/merchant/storefront";
export const TOKEN_COOKIE = "dp_token";
export const GUEST_COOKIE = "dp_guest";
export const TENANT_HEADER = "x-tenant";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public errors?: Record<string, string[]>) {
    super(message);
  }
}

type Opts = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Send the customer token (🔒 endpoints). */
  auth?: boolean;
  /** Seconds for Next's data cache. Omit for no-store (default for auth / writes). */
  revalidate?: number;
  tags?: string[];
  headers?: Record<string, string>;
};

/** Tenant = merchant username, put on the request by proxy.ts (host → tenant). */
export const getTenant = cache(async (): Promise<string> => {
  const h = await headers();
  const t = h.get(TENANT_HEADER) || process.env.NEXT_PUBLIC_TENANT || "";
  if (!t) throw new ApiError(404, "MERCHANT_NOT_FOUND", "No storefront tenant for this host.");
  return t;
});

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(TOKEN_COOKIE)?.value;
}

export async function sf<T>(path: string, o: Opts = {}): Promise<T> {
  if (!API_BASE_URL) throw new ApiError(500, "API_NOT_CONFIGURED", "API_BASE_URL is not set.");
  const tenant = await getTenant();
  const jar = await cookies();
  const h: Record<string, string> = { Accept: "application/json", "Accept-Language": "en", ...o.headers };
  if (o.body !== undefined) h["Content-Type"] = "application/json";
  const guest = jar.get(GUEST_COOKIE)?.value;
  if (guest) h["X-Guest-Id"] = guest;
  if (process.env.STOREFRONT_KEY) h["X-Storefront-Key"] = process.env.STOREFRONT_KEY;
  if (o.auth) {
    const token = jar.get(TOKEN_COOKIE)?.value;
    if (!token) throw new ApiError(401, "UNAUTHENTICATED", "Please log in.");
    h.Authorization = `Bearer ${token}`;
  }
  const cacheable = o.revalidate !== undefined && !o.auth && (o.method ?? "GET") === "GET";
  const url = `${API_BASE_URL}${STOREFRONT_PATH}/${encodeURIComponent(tenant)}/${path.replace(/^\//, "")}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: o.method ?? "GET",
      headers: h,
      body: o.body !== undefined ? JSON.stringify(o.body) : undefined,
      ...(cacheable ? { next: { revalidate: o.revalidate, tags: [`tenant:${tenant}`, ...(o.tags ?? [])] } } : { cache: "no-store" as const }),
    });
  } catch {
    throw new ApiError(503, "API_UNREACHABLE", "The booking service is unreachable. Please try again.");
  }
  const json = (await res.json().catch(() => null)) as
    | { success?: boolean; data?: T; message?: string; code?: string; error?: { code?: string; message?: string }; errors?: Record<string, string[]> }
    | null;
  if (!res.ok || !json || json.success === false) {
    const code = json?.code ?? json?.error?.code ?? (res.status === 401 ? "UNAUTHENTICATED" : `HTTP_${res.status}`);
    throw new ApiError(res.status, code, json?.error?.message ?? json?.message ?? `Request failed (${res.status})`, json?.errors);
  }
  return json.data as T;
}

/** Global (no-tenant) host resolution used by proxy.ts. */
export async function resolveHost(domain: string): Promise<{ tenant: string; primaryDomain?: string; redirect?: string | null } | null> {
  if (!API_BASE_URL) return null;
  try {
    const res = await fetch(`${API_BASE_URL}${STOREFRONT_PATH}/resolve?domain=${encodeURIComponent(domain)}`, {
      headers: { Accept: "application/json" }, next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { data?: { tenant: string; primaryDomain?: string; redirect?: string | null } };
    return j.data?.tenant ? j.data : null;
  } catch {
    return null;
  }
}

/** Is the error "not logged in / token for another tenant"? */
export const isAuthError = (e: unknown) =>
  e instanceof ApiError && (e.status === 401 || e.code === "UNAUTHENTICATED" || e.code === "TENANT_MISMATCH");

export { pick } from "./storefront-shared";
