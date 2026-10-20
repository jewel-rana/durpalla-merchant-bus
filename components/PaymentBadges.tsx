const badges = [
  { n: "bKash", c: "text-[#E2136E]" }, { n: "Nagad", c: "text-[#EC1C24]" }, { n: "Rocket", c: "text-[#8C3494]" },
  { n: "VISA", c: "text-[#1A1F71] italic" }, { n: "Mastercard", c: "text-[#EB001B]" }, { n: "AMEX", c: "text-[#2E77BC]" },
];
export function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Accepted payment methods">
      {badges.map((b) => (
        <li key={b.n} className={`rounded-md bg-white px-2.5 py-1 text-xs font-extrabold ${b.c}`}>{b.n}</li>
      ))}
    </ul>
  );
}
