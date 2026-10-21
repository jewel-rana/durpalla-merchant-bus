"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cancelBooking } from "@/lib/auth-actions";
import { taka } from "@/lib/merchant";

/** POST bookings/{id}/cancel, after showing the GET bookings/{id}/cancellation preview. */
export function CancelButton({ id, refundable, gatewayFee }: { id: string; refundable?: number; gatewayFee?: number }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  if (!confirm) return <button type="button" onClick={() => setConfirm(true)} className="btn-outline !border-red-300 !text-red-600 hover:!bg-red-50">Cancel booking</button>;
  return (
    <div className="card space-y-2 p-4 text-sm">
      <p>Refund estimate: <b>{taka(refundable ?? 0)}</b></p>
      {gatewayFee ? <p className="text-xs text-slate-500">The payment gateway charge ({taka(gatewayFee)}) is non-refundable.</p> : null}
      <div className="flex gap-2">
        <button type="button" disabled={busy} className="btn-accent !bg-red-600 !py-1.5" onClick={async () => {
          setBusy(true);
          const r = await cancelBooking(id);
          setBusy(false);
          if (r.ok) { setMsg("Cancellation requested."); router.refresh(); } else setMsg(r.message);
        }}>{busy ? "Cancelling…" : "Confirm cancel"}</button>
        <button type="button" className="btn-outline !py-1.5" onClick={() => setConfirm(false)}>Keep booking</button>
      </div>
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </div>
  );
}
