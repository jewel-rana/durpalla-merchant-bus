"use client";
import Link from "next/link";
import { useSite } from "@/lib/site-context";

export function Logo({ light = false }: { light?: boolean }) {
  const merchant = useSite();
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={`${merchant.name} home`}>
      {merchant.logo.src ? (
        // eslint-disable-next-line @next/next/no-img-element -- merchant logo from any CDN
        <img src={merchant.logo.src} alt="" className="h-9 w-9 rounded-lg object-contain" />
      ) : (
        <span className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-extrabold ${light ? "bg-white text-brand" : "bg-brand text-white"}`}>
          {merchant.logo.text}
        </span>
      )}
      <span className={`text-lg font-bold leading-tight ${light ? "text-white" : "text-brand"}`}>{merchant.shortName}</span>
    </Link>
  );
}
