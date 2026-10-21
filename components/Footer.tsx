"use client";
import Link from "next/link";
import { useSite } from "@/lib/site-context";
import { Logo } from "./Logo";
import { PaymentBadges } from "./PaymentBadges";

export function Footer() {
  const merchant = useSite();
  return (
    <footer className="no-print bg-[#0b1530] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-3 max-w-sm text-sm text-slate-400">{merchant.tagline || merchant.seo.description}</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">Quick links</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/search" className="hover:text-white">Schedules</Link></li>
            <li><Link href="/account/bookings" className="hover:text-white">My Bookings</Link></li>
            <li><Link href="/login" className="hover:text-white">Login</Link></li>
            {Object.keys(merchant.policies).map((k) => (
              <li key={k}><Link href={`/policies/${k}`} className="capitalize hover:text-white">{k.replace(/[-_]/g, " ")}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">Contact</h2>
          <ul className="space-y-2 text-sm">
            {merchant.contact.hotline && <li>Hotline: {merchant.contact.hotline}</li>}
            {merchant.contact.phone && merchant.contact.phone !== merchant.contact.hotline && <li>{merchant.contact.phone}</li>}
            {merchant.contact.email && <li>{merchant.contact.email}</li>}
            {merchant.contact.address && <li>{merchant.contact.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-5 text-xs md:flex-row md:items-center md:px-8">
          <p>© {new Date().getFullYear()} {merchant.name}. All rights reserved. · <a href={merchant.poweredBy.url} className="font-semibold text-white">{merchant.poweredBy.label}</a></p>
          <PaymentBadges />
        </div>
      </div>
    </footer>
  );
}
