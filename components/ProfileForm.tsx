"use client";
import { useState } from "react";
import type { Customer } from "@/lib/account";
import { updateProfile } from "@/lib/auth-actions";

type Field = "name" | "phone" | "email" | "dob" | "address" | "city" | "nidNo";

/** GET/PATCH me: name, email, gender, date of birth, address, city and NID. The mobile number is the login and is read-only. */
export function ProfileForm({ initial }: { initial: Customer }) {
  const [p, setP] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Customer>) => { setP({ ...p, ...patch }); setSaved(false); };
  const f = (k: Field, label: string, type = "text", disabled = false, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      <input id={k} type={type} className="field disabled:bg-slate-50" disabled={disabled} value={p[k] ?? ""} onChange={(e) => set({ [k]: e.target.value })} {...extra} />
    </div>
  );
  return (
    <form className="space-y-5" onSubmit={async (e) => {
      e.preventDefault();
      if (p.nidNo && !/^(\d{10}|\d{13}|\d{17})$/.test(p.nidNo)) return setErr("NID must be 10, 13 or 17 digits.");
      setBusy(true); setErr("");
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
        <div>
          <label className="label" htmlFor="gender">Gender</label>
          <select id="gender" className="field" value={p.gender} onChange={(e) => set({ gender: e.target.value as Customer["gender"] })}>
            <option value="">Prefer not to say</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
          </select>
        </div>
        {f("dob", "Date of birth", "date", false, { max: new Date().toISOString().slice(0, 10) })}
        {f("nidNo", p.nidVerified ? "NID (verified)" : "NID number", "text", p.nidVerified, { inputMode: "numeric", placeholder: "10, 13 or 17 digits" })}
        <div className="sm:col-span-2">{f("address", "Address")}</div>
        {f("city", "City")}
      </fieldset>
      <div className="flex items-center gap-3">
        <button className="btn-accent" type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
        {saved && <span role="status" className="text-sm text-emerald-700">✓ Profile updated</span>}
        {err && <span role="alert" className="text-sm text-red-600">{err}</span>}
      </div>
    </form>
  );
}
