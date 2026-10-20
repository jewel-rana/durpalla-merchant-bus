"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { merchant } from "@/lib/merchant";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (step === "phone") {
      if (!/^01\d{9}$/.test(phone)) return setErr("Enter a valid 11-digit mobile number.");
      setBusy(true); await api.requestOtp(phone); setBusy(false); setStep("otp");
    } else {
      if (!/^\d{6}$/.test(otp)) return setErr("Enter the 6-digit code.");
      setBusy(true);
      const { token } = await api.verifyOtp(phone, otp);
      localStorage.setItem("dp_token", token);
      router.push("/account");
    }
  }

  return (
    <form onSubmit={submit} className="card w-full max-w-md p-7">
      <h1 className="text-2xl font-bold">{step === "phone" ? "Log in" : "Verify your number"}</h1>
      <p className="mb-6 text-sm text-slate-500">{step === "phone" ? `Manage your ${merchant.shortName} bookings with your mobile number.` : `We sent a 6-digit code to ${phone}.`}</p>
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
          <button type="button" className="mt-2 text-sm font-semibold text-brand" onClick={() => setStep("phone")}>Change number</button>
        </div>
      )}
      {err && <p role="alert" className="mt-3 text-sm text-red-600">{err}</p>}
      <button type="submit" className="btn-accent mt-6 w-full" disabled={busy}>{busy ? "Please wait…" : step === "phone" ? "Send OTP" : "Verify & continue"}</button>
      <p className="mt-4 text-center text-xs text-slate-400">Secured by Durpalla Limited</p>
    </form>
  );
}
