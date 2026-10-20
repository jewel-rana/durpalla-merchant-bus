"use client";
export function PrintButton() {
  return <button type="button" className="btn-accent !py-2 text-sm" onClick={() => window.print()}>Print / Save PDF</button>;
}
