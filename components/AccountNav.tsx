"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth-actions";
import { copy } from "@/lib/copy";

const items = [
  { href: "/account", l: "Dashboard", i: "🏠" },
  { href: "/account/bookings", l: "My bookings", i: copy.bookingIcon },
  { href: "/account/profile", l: "Profile", i: "👤" },
];

export function AccountNav() {
  const p = usePathname();
  const router = useRouter();
  const active = (h: string) => (h === "/account" ? p === h : p.startsWith(h));
  const cls = (on: boolean) => `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${on ? "bg-brand text-white" : "text-slate-700 hover:bg-brand-light"}`;
  return (
    <nav aria-label="Account" className="no-print flex gap-2 overflow-x-auto lg:flex-col">
      {items.map((it) => (
        <Link key={it.href} href={it.href} aria-current={active(it.href) ? "page" : undefined} className={cls(active(it.href))}>
          <span aria-hidden>{it.i}</span>{it.l}
        </Link>
      ))}
      <button type="button" className={cls(false)} onClick={async () => { await logout(); router.replace("/login"); router.refresh(); }}>
        <span aria-hidden>↩</span>Log out
      </button>
    </nav>
  );
}
