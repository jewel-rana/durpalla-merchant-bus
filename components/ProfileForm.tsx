"use client";
import { useState } from "react";
import type { Customer } from "@/lib/account";
import { updateProfile } from "@/lib/auth-actions";

/** GET/PATCH me. The API stores name and email; the mobile number is the login and is read-only. */
export function ProfileForm({ initial }: { initial: Customer }) {
  const [p, setP] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const f = (k: "name" | "phone" | "email", label: string, type = "text", disabled = false) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      <input id={k} type={type} className="field disabled:bg-slate-50" disabled={disabled} value={p[k] ?? ""} onChange={(e) => { setP({ ...p, [k]: e.target.value }); setSaved(false); }} />
    </div>
  );
  return (
    <form className="space-y-5" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setErr("");
      const r = await updateProfile(p);
      setBusy(false);
      if (r.ok) { setP(r.data); setSaved(true); } else setErr(r.message);
    }}>
      <div className="card flex items-center gap-4 p-5">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand text-xl font-bold text-white">{p.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span>
        <div><p className="text-lg font-bold">{p.name}</p><p className="text-sm text-slate-500">Verified mobile · {p.phone}</p></div>
      </div>
      <fieldset className="card grid gap-4 p-5 sm:grid-cols-2">
        <legend className="sr-only">Personal information</legend>
        {f("name", "Full name")}
        {f("phone", "Mobile number", "tel", true)}
        {f("email", "Email", "email")}
      </fieldset>
      <div className="flex items-center gap-3">
        <button className="btn-accent" type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
        {saved && <span role="status" className="text-sm text-emerald-700">✓ Profile updated</span>}
        {err && <span role="alert" className="text-sm text-red-600">{err}</span>}
      </div>
    </form>
  );
}
