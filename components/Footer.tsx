import Link from "next/link";
import { merchant } from "@/lib/merchant";
import { Logo } from "./Logo";
import { PaymentBadges } from "./PaymentBadges";

export function Footer() {
  return (
    <footer className="no-print bg-[#0b1530] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-3 max-w-sm text-sm text-slate-400">{merchant.tagline}. Book intercity AC & non-AC coach tickets online, choose your seat and pay securely.</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">Quick links</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/search" className="hover:text-white">Schedules</Link></li>
            <li><Link href="/account/bookings" className="hover:text-white">My Bookings</Link></li>
            <li><Link href="/login" className="hover:text-white">Login</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">Contact</h2>
          <ul className="space-y-2 text-sm">
            <li>Hotline: {merchant.contact.hotline}</li>
            <li>{merchant.contact.phone}</li>
            <li>{merchant.contact.email}</li>
            <li>{merchant.contact.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-5 text-xs md:flex-row md:items-center md:px-8">
          <p>© 2026 {merchant.name}. All rights reserved. · Powered by <span className="font-semibold text-white">Durpalla Limited</span></p>
          <PaymentBadges />
        </div>
      </div>
    </footer>
  );
}
