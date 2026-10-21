import type { BookingStatus } from "@/lib/account";

export function StatusBadge({ s }: { s: BookingStatus }) {
  const c = s === "upcoming" ? "bg-blue-50 text-blue-700" : s === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${c}`}>{s}</span>;
}

export function QrPlaceholder({ value, size = 120 }: { value: string; size?: number }) {
  // Deterministic pseudo-QR pattern; replace with a real QR library (e.g. qrcode.react) for production.
  const n = 21;
  let h = 0;
  for (const ch of value) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < n * n; i++) { h = (h * 1103515245 + 12345) >>> 0; cells.push((h >> 16) % 2 === 0); }
  const finder = (x: number, y: number) => [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const finderOn = (x: number, y: number) => {
    for (const [fx, fy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
      const dx = x - fx, dy = y - fy;
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    }
    return false;
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} role="img" aria-label={`QR code for ${value}`} className="rounded bg-white">
      {cells.map((on, i) => {
        const x = i % n, y = Math.floor(i / n);
        const fill = finder(x, y) ? finderOn(x, y) : on;
        return fill ? <rect key={i} x={x} y={y} width="1" height="1" fill="#0f172a" /> : null;
      })}
    </svg>
  );
}

export const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
