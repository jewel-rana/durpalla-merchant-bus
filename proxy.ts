import { NextResponse, type NextRequest } from "next/server";

/**
 * Host → tenant (merchant username), per durpalla-apigw docs/storefront-domains.md:
 *  - `{tenant}.STOREFRONT_BASE_DOMAIN` (default durpalla.site) → subdomain
 *  - any other host (custom CNAME domain) → GET /resolve?domain=
 *  - localhost / unresolved → NEXT_PUBLIC_TENANT (local dev)
 * The tenant is passed to server code as the `x-tenant` request header.
 */
const API = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
const BASE_DOMAIN = (process.env.STOREFRONT_BASE_DOMAIN ?? "durpalla.site").toLowerCase();
const DEV_TENANT = process.env.NEXT_PUBLIC_TENANT ?? "";
const RESERVED = new Set(["www", "api", "admin", "app", "edge"]);

async function resolve(host: string) {
  if (!API) return null;
  try {
    const r = await fetch(`${API}/api/v1/merchant/storefront/resolve?domain=${encodeURIComponent(host)}`, {
      headers: { Accept: "application/json" }, next: { revalidate: 300 },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { data?: { tenant?: string; redirect?: string | null } };
    return j.data?.tenant ? j.data : null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").split(",")[0].split(":")[0].trim().toLowerCase();
  const isLocal = !host || host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  let tenant = "";
  if (!isLocal && host.endsWith(`.${BASE_DOMAIN}`)) {
    const sub = host.slice(0, -(BASE_DOMAIN.length + 1));
    if (!sub.includes(".") && !RESERVED.has(sub)) tenant = sub;
  } else if (!isLocal) {
    const site = await resolve(host);
    if (site?.redirect && req.method === "GET") {
      const to = new URL(req.nextUrl.pathname + req.nextUrl.search, site.redirect);
      if (to.host !== host) return NextResponse.redirect(to, 308);
    }
    tenant = site?.tenant ?? "";
  }
  tenant ||= DEV_TENANT;
  if (!tenant) return new NextResponse("Storefront not found", { status: 404 });

  const headers = new Headers(req.headers);
  headers.set("x-tenant", tenant);
  // Guest id for seat holds (X-Guest-Id); holds follow the customer after login.
  const guest = req.cookies.get("dp_guest")?.value ? null : crypto.randomUUID();
  if (guest) headers.set("cookie", [req.headers.get("cookie"), `dp_guest=${guest}`].filter(Boolean).join("; "));
  const res = NextResponse.next({ request: { headers } });
  if (guest) res.cookies.set("dp_guest", guest, { httpOnly: true, sameSite: "lax", secure: !isLocal, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|img|favicon.ico|robots.txt|sitemap.xml).*)"],
};
