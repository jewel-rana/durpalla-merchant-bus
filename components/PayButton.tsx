"use client";
import { useState } from "react";
import { initiatePayment } from "@/lib/auth-actions";
import { useSite } from "@/lib/site-context";

/** Retry payment for an unpaid booking: POST payments/initiate → gateway redirect. */
export function PayButton({ bookingId }: { bookingId: string }) {
  const { payments } = useSite();
  const [method, setMethod] = useState(payments.methods[0]?.code ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (!payments.methods.length) return <p className="text-sm text-slate-500">Online payment is not available for this merchant.</p>;
  return (
    <div className="space-y-2">
      <select className="field" value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Payment method">
        {payments.methods.map((m) => <option key={m.code} value={m.code}>{m.name}</option>)}
      </select>
      <button type="button" className="btn-accent w-full" disabled={busy} onClick={async () => {
        setBusy(true); setErr("");
        const r = await initiatePayment(bookingId, method);
        if (r.ok && r.data.redirectUrl) window.location.href = r.data.redirectUrl;
        else { setBusy(false); setErr(r.ok ? "The gateway did not return a payment link." : r.message); }
      }}>{busy ? "Redirecting…" : "Pay now"}</button>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
