import { cache } from "react";
import { sf } from "./storefront";
import { toMerchant, type MerchantConfig } from "./merchant";

/** `GET {tenant}/config`, revalidated every 5 minutes (matches STOREFRONT_CONFIG_CACHE_TTL). */
export const getSite = cache(async (): Promise<MerchantConfig> => toMerchant(await sf<Record<string, unknown>>("config", { revalidate: 300 })));

/** `GET {tenant}/home` (banners, offers, sections, popularRoutes | featuredRooms). */
export const getHome = cache(async () => sf<Record<string, unknown>>("home", { revalidate: 300 }));

export interface Offer { id: string; code?: string; title: string; subtitle?: string; description?: string; image?: string | null; endsAt?: string | null }
export const getOffers = cache(async () => sf<Offer[]>("offers", { revalidate: 300 }));
