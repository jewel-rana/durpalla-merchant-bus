import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { BookingTable } from "@/components/BookingTable";

export const metadata: Metadata = { title: "My bookings" };
const tabs = ["upcoming", "completed", "cancelled"] as const;

export default async function Bookings({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "upcoming" } = await searchParams;
  const list = await api.listBookings();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">My bookings</h1>
      <nav aria-label="Booking status" className="mb-5 inline-flex rounded-full bg-white p-1 shadow-sm">
        {tabs.map((t) => (
          <Link key={t} href={`?tab=${t}`} aria-current={tab === t ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${tab === t ? "bg-brand text-white" : "text-slate-600"}`}>
            {t} ({list.filter((b) => b.status === t).length})
          </Link>
        ))}
      </nav>
      <BookingTable items={list.filter((b) => b.status === tab)} />
    </div>
  );
}
