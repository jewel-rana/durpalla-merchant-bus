import { NextResponse, type NextRequest } from "next/server";
import { hostMap, DEFAULT_MERCHANT_ID } from "@/lib/merchant";

/**
 * Stub: resolve the merchant from the request hostname and pass it on as a
 * header (x-merchant-id). Pages currently use the default merchant config;
 * wire this header into getMerchant() when serving several merchants from
 * one deployment.
 */
export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0];
  const id = hostMap[host] ?? DEFAULT_MERCHANT_ID;
  const headers = new Headers(request.headers);
  headers.set("x-merchant-id", id);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|img|favicon.ico).*)"],
};
