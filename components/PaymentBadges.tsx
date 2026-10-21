"use client";
import { useSite } from "@/lib/site-context";

const colour: Record<string, string> = {
  bkash: "text-[#E2136E]", nagad: "text-[#EC1C24]", rocket: "text-[#8C3494]", upay: "text-[#0D47A1]",
  sslcommerz: "text-[#1A1F71]", card: "text-[#1A1F71]", visa: "text-[#1A1F71] italic", mastercard: "text-[#EB001B]", amex: "text-[#2E77BC]",
};

/** Payment methods the merchant actually offers (`config.payments.methods`). */
export function PaymentBadges({ className = "" }: { className?: string }) {
  const { payments } = useSite();
  if (!payments.methods.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Accepted payment methods">
      {payments.methods.map((b) => (
        <li key={b.code} className={`rounded-md bg-white px-2.5 py-1 text-xs font-extrabold ${colour[b.code] ?? "text-slate-800"}`}>{b.name}</li>
      ))}
    </ul>
  );
}
