import type { Metadata } from "next";
import Link from "next/link";
import { loadBookings } from "@/lib/loadBookings";
import { authed } from "@/lib/account";
import { BookingTable } from "@/components/BookingTable";

export const metadata: Metadata = { title: "My bookings" };
const tabs = ["upcoming", "completed", "cancelled"] as const;

export default async function Bookings({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: t = "upcoming" } = await searchParams;
  const tab = (tabs as readonly string[]).includes(t) ? (t as (typeof tabs)[number]) : "upcoming";
  const list = await authed(() => loadBookings(tab), "/account/bookings");
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">My bookings</h1>
      <nav aria-label="Booking status" className="mb-5 inline-flex rounded-full bg-white p-1 shadow-sm">
        {tabs.map((x) => (
          <Link key={x} href={`?tab=${x}`} aria-current={tab === x ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${tab === x ? "bg-brand text-white" : "text-slate-600"}`}>
            {x}{tab === x ? ` (${list.length})` : ""}
          </Link>
        ))}
      </nav>
      <BookingTable items={list} />
    </div>
  );
}
