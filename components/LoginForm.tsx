"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { requestOtp, verifyOtp } from "@/lib/auth-actions";
import { useSite } from "@/lib/site-context";
import { copy } from "@/lib/copy";

/** OTP login: POST auth/otp/send → POST auth/otp/verify (token kept in an httpOnly cookie). */
export function LoginForm() {
  const merchant = useSite();
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (step === "phone") {
      if (!/^01\d{9}$/.test(phone)) return setErr("Enter a valid 11-digit mobile number.");
      setBusy(true);
      const r = await requestOtp(phone);
      setBusy(false);
      if (!r.ok) return setErr(r.message);
      setStep("otp");
    } else {
      if (!/^\d{4,6}$/.test(otp)) return setErr("Enter the code we sent you.");
      setBusy(true);
      const r = await verifyOtp(phone, otp);
      if (!r.ok) { setBusy(false); return setErr(r.code === "OTP_EXPIRED" ? "That code has expired. Request a new one." : r.message); }
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/account");
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="card w-full max-w-md p-7">
      <h1 className="text-2xl font-bold">{step === "phone" ? "Log in" : "Verify your number"}</h1>
      <p className="mb-6 text-sm text-slate-500">{step === "phone" ? `Manage your ${merchant.shortName} ${copy.bookingsWord} with your mobile number.` : `We sent a one-time code to ${phone}.`}</p>
      {step === "phone" ? (
        <div>
          <label htmlFor="phone" className="label">Mobile number</label>
          <div className="flex"><span className="grid place-items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm">+88</span>
            <input id="phone" inputMode="numeric" autoComplete="tel" className="field !rounded-l-none" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} /></div>
        </div>
      ) : (
        <div>
          <label htmlFor="otp" className="label">One-time code</label>
          <input id="otp" inputMode="numeric" autoComplete="one-time-code" className="field text-center text-2xl tracking-[0.5em]" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
          <div className="mt-2 flex justify-between text-sm font-semibold text-brand">
            <button type="button" onClick={() => setStep("phone")}>Change number</button>
            <button type="button" disabled={busy} onClick={async () => { const r = await requestOtp(phone); setErr(r.ok ? "" : r.message); }}>Resend code</button>
          </div>
        </div>
      )}
      {err && <p role="alert" className="mt-3 text-sm text-red-600">{err}</p>}
      <button type="submit" className="btn-accent mt-6 w-full" disabled={busy}>{busy ? "Please wait…" : step === "phone" ? "Send OTP" : "Verify & continue"}</button>
      <p className="mt-4 text-center text-xs text-slate-400">Secured by Durpalla Limited</p>
    </form>
  );
}
