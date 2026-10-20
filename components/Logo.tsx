import Link from "next/link";
import { merchant } from "@/lib/merchant";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={`${merchant.name} home`}>
      <span className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-extrabold ${light ? "bg-white text-brand" : "bg-brand text-white"}`}>
        {merchant.logo.text}
      </span>
      <span className={`text-lg font-bold leading-tight ${light ? "text-white" : "text-brand"}`}>{merchant.shortName}</span>
    </Link>
  );
}
