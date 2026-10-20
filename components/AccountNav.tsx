"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/account", l: "Dashboard", i: "🏠" },
  { href: "/account/bookings", l: "My bookings", i: "🎟️" },
  { href: "/account/profile", l: "Profile", i: "👤" },
  { href: "/login", l: "Log out", i: "↩" },
];

export function AccountNav() {
  const p = usePathname();
  const active = (h: string) => (h === "/account" ? p === h : p.startsWith(h));
  return (
    <nav aria-label="Account" className="no-print flex gap-2 overflow-x-auto lg:flex-col">
      {items.map((it) => (
        <Link key={it.href} href={it.href} aria-current={active(it.href) ? "page" : undefined}
          className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${active(it.href) ? "bg-brand text-white" : "text-slate-700 hover:bg-brand-light"}`}>
          <span aria-hidden>{it.i}</span>{it.l}
        </Link>
      ))}
    </nav>
  );
}
