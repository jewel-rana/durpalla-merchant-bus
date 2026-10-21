"use client";
import { createContext, useContext } from "react";
import type { MerchantConfig } from "./merchant";

const Ctx = createContext<MerchantConfig | null>(null);

export function SiteProvider({ value, children }: { value: MerchantConfig; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Current merchant config (from `GET {tenant}/config`) in client components. */
export function useSite(): MerchantConfig {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSite() outside <SiteProvider>");
  return v;
}
