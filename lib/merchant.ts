/**
 * White-label merchant (site) configuration, built from `GET {tenant}/config`.
 * There is no local merchant data: everything comes from the storefront API.
 */
import { pick } from "./storefront-shared";

export interface PaymentOption { code: string; name: string; icon?: string | null }
export interface MerchantConfig {
  id: string;
  tenant: string;
  name: string;
  shortName: string;
  tagline: string;
  domain: string;
  logo: { text: string; src?: string };
  favicon?: string;
  colors: { primary: string; primaryDark: string; primaryLight: string; accent: string; accentDark: string };
  contact: { phone: string; email: string; address: string; hotline: string };
  social: Record<string, string>;
  apps: { appStore?: string; googlePlay?: string };
  heroImage?: string;
  banners: { image: string; title?: string; subtitle?: string; link?: string }[];
  seo: { title?: string; description?: string; keywords?: string; image?: string };
  policies: Record<string, string>;
  locale: string;
  verticals: string[];
  payments: { mode: "own" | "durpalla"; sandbox: boolean; methods: PaymentOption[]; gatewayFeeBearer: "merchant" | "customer"; gatewayFeePercent: number };
  poweredBy: { label: string; url: string };
}

/** Theme defaults only (used when the merchant has not set a colour). */
const THEME = { primary: "#0B3D91", primaryDark: "#082C6B", primaryLight: "#E8EFFB", accent: "#F97316", accentDark: "#EA580C" };

const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "•";

function shade(hex: string, amt: number) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? s * (1 + amt) : s + (255 - s) * amt)));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => ch(c).toString(16).padStart(2, "0")).join("")}`;
}

export function toMerchant(c: Record<string, unknown>): MerchantConfig {
  const colors = (c.colors ?? {}) as Record<string, string>;
  const primary = colors.primary || THEME.primary;
  const accent = colors.accent || colors.secondary || THEME.accent;
  const contact = (c.contact ?? {}) as Record<string, unknown>;
  const pay = (c.payments ?? {}) as Record<string, unknown>;
  const footer = (c.footer ?? {}) as Record<string, unknown>;
  const app = (c.appLinks ?? c.app_links ?? {}) as Record<string, string>;
  const domains = (c.domains ?? {}) as Record<string, string>;
  const name = str(c.name) || str(c.tenant);
  const banners = (Array.isArray(c.banners) ? c.banners : []).map((b) =>
    typeof b === "string" ? { image: b } : { image: str(pick(b, "image", "src", "url")), title: pick<string>(b, "title"), subtitle: pick<string>(b, "subtitle"), link: pick<string>(b, "link", "url") },
  ).filter((b) => b.image);
  const methods = (Array.isArray(pay.methods) ? pay.methods : []) as PaymentOption[];
  const bearer = str(pay.gatewayFeeBearer ?? c.gateway_fee_bearer) === "customer" ? "customer" : "merchant";
  return {
    id: str(c.merchantId),
    tenant: str(c.tenant),
    name,
    shortName: str(pick(c, "shortName")) || name,
    tagline: str(c.tagline),
    domain: domains.primary || domains.default || "",
    logo: { text: initials(name), src: str(c.logo) || undefined },
    favicon: str(c.favicon) || undefined,
    colors: {
      primary,
      primaryDark: colors.primaryDark || shade(primary, -0.28),
      primaryLight: colors.primaryLight || shade(primary, 0.9),
      accent,
      accentDark: colors.accentDark || shade(accent, -0.1),
    },
    contact: { phone: str(contact.phone), email: str(contact.email), address: str(contact.address), hotline: str(contact.hotline) || str(contact.phone) },
    social: (c.social ?? {}) as Record<string, string>,
    apps: { appStore: app.appStore || app.ios || undefined, googlePlay: app.googlePlay || app.android || undefined },
    heroImage: banners[0]?.image,
    banners,
    seo: (c.seo ?? {}) as MerchantConfig["seo"],
    policies: Object.fromEntries(Object.entries((c.policies ?? {}) as Record<string, unknown>).filter(([, v]) => typeof v === "string" && v)) as Record<string, string>,
    locale: str(c.locale) || "en",
    verticals: (Array.isArray(c.verticals) ? c.verticals : []).map(String),
    payments: {
      mode: str(pay.mode) === "own" ? "own" : "durpalla",
      sandbox: Boolean(pay.sandbox),
      methods,
      gatewayFeeBearer: bearer,
      gatewayFeePercent: Number(pay.gatewayFeePercent ?? 0) || 0,
    },
    poweredBy: { label: str(footer.poweredBy) || "Powered by Durpalla Limited", url: str(footer.poweredByUrl) || "https://durpalla.com" },
  };
}

/** True when the customer pays the Durpalla gateway charge as a separate line. */
export const customerPaysFee = (m: MerchantConfig) => m.payments.mode === "durpalla" && m.payments.gatewayFeeBearer === "customer" && m.payments.gatewayFeePercent > 0;

export function merchantCssVars(m: MerchantConfig): Record<string, string> {
  return {
    "--brand": m.colors.primary,
    "--brand-dark": m.colors.primaryDark,
    "--brand-light": m.colors.primaryLight,
    "--accent": m.colors.accent,
    "--accent-dark": m.colors.accentDark,
  };
}

export const taka = (n: number) => `৳${(Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
