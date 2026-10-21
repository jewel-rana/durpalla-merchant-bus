"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useSite } from "@/lib/site-context";

const nav = [
  { href: "/#routes", label: "Routes" },
  { href: "/search", label: "Schedules" },
  { href: "/#offers", label: "Offers" },
];

export function Header() {
  const merchant = useSite();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);
  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-brand">{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/account/bookings" className="btn-accent hidden !py-2 text-sm sm:inline-flex">My Bookings</Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 lg:hidden"
            aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" id="mobile-menu" aria-label="Menu">
          <button className="absolute inset-0 bg-slate-900/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-80 max-w-[85%] flex-col bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button className="grid h-9 w-9 place-items-center rounded-lg border" aria-label="Close menu" onClick={() => setOpen(false)}>✕</button>
            </div>
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {[...nav, { href: "/account", label: "My Account" }, { href: "/account/bookings", label: "My Bookings" }, { href: "/login", label: "Login" }].map((n) => (
                <Link key={n.href + n.label} href={n.href} onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-3 font-medium hover:bg-brand-light ${pathname === n.href ? "bg-brand-light text-brand" : "text-slate-700"}`}>
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto rounded-xl bg-brand-light p-4 text-sm">
              {merchant.contact.hotline && <p className="font-semibold text-brand">Hotline {merchant.contact.hotline}</p>}
              <p className="text-slate-600">{merchant.contact.email}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
