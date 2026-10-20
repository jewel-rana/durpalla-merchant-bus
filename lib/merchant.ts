/**
 * White-label merchant configuration.
 * Re-theme or re-brand a site by editing ONE entry here (or loading it from
 * the Durpalla merchant API by hostname - see proxy.ts / getMerchant()).
 */
export interface MerchantConfig {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  domain: string;
  logo: { text: string; src?: string };
  colors: {
    primary: string; // deep blue
    primaryDark: string;
    primaryLight: string;
    accent: string; // orange CTA
    accentDark: string;
  };
  contact: { phone: string; email: string; address: string; hotline: string };
  social: { facebook?: string; youtube?: string };
  apps: { appStore: string; googlePlay: string };
  heroImage: string;
}

export const merchants: Record<string, MerchantConfig> = {
  greenline: {
    id: "greenline",
    name: "Green Line Paribahan",
    shortName: "Green Line",
    tagline: "Travel Bangladesh in comfort",
    domain: "greenline.example.com",
    logo: { text: "GL" },
    colors: {
      primary: "#0B3D91",
      primaryDark: "#082C6B",
      primaryLight: "#E8EFFB",
      accent: "#F97316",
      accentDark: "#EA580C",
    },
    contact: {
      phone: "+880 1700-000000",
      hotline: "16XXX",
      email: "support@greenline.example.com",
      address: "Rajarbagh, Dhaka 1000, Bangladesh",
    },
    social: { facebook: "#", youtube: "#" },
    apps: { appStore: "#", googlePlay: "#" },
    heroImage: "/img/bus2.jpg",
  },
};

export const DEFAULT_MERCHANT_ID = process.env.NEXT_PUBLIC_MERCHANT_ID ?? "greenline";

/** Hostname -> merchant id. In production this comes from Durpalla's backend. */
export const hostMap: Record<string, string> = {
  "greenline.example.com": "greenline",
  localhost: "greenline",
};

export function getMerchant(id: string = DEFAULT_MERCHANT_ID): MerchantConfig {
  return merchants[id] ?? merchants.greenline;
}

export const merchant = getMerchant();

export function merchantCssVars(m: MerchantConfig = merchant): Record<string, string> {
  return {
    "--brand": m.colors.primary,
    "--brand-dark": m.colors.primaryDark,
    "--brand-light": m.colors.primaryLight,
    "--accent": m.colors.accent,
    "--accent-dark": m.colors.accentDark,
  };
}

export const taka = (n: number) => `৳${n.toLocaleString("en-IN")}`;
