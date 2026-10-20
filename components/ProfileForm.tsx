"use client";
import { useState } from "react";
import type { Customer } from "@/lib/types";
import { api } from "@/lib/api";

export function ProfileForm({ initial }: { initial: Customer }) {
  const [p, setP] = useState(initial);
  const [saved, setSaved] = useState(false);
  const f = (k: keyof Customer, label: string, type = "text", disabled = false) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      <input id={k} type={type} className="field disabled:bg-slate-50" disabled={disabled} value={p[k] ?? ""} onChange={(e) => { setP({ ...p, [k]: e.target.value }); setSaved(false); }} />
    </div>
  );
  return (
    <form className="space-y-5" onSubmit={async (e) => { e.preventDefault(); setP(await api.updateProfile(p)); setSaved(true); }}>
      <div className="card flex items-center gap-4 p-5">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand text-xl font-bold text-white">{p.name.split(" ").map((x) => x[0]).join("")}</span>
        <div><p className="text-lg font-bold">{p.name}</p><p className="text-sm text-slate-500">Verified mobile · {p.phone}</p></div>
      </div>
      <fieldset className="card grid gap-4 p-5 sm:grid-cols-2">
        <legend className="sr-only">Personal information</legend>
        {f("name", "Full name")}
        {f("phone", "Mobile number", "tel", true)}
        {f("email", "Email", "email")}
        {f("dob", "Date of birth", "date")}
        <div>
          <label className="label" htmlFor="gender">Gender</label>
          <select id="gender" className="field" value={p.gender} onChange={(e) => setP({ ...p, gender: e.target.value })}><option>Male</option><option>Female</option><option>Other</option></select>
        </div>
        {f("nid", "NID / Passport (optional)")}
        <div className="sm:col-span-2">{f("address", "Address")}</div>
      </fieldset>
      <div className="flex items-center gap-3">
        <button className="btn-accent" type="submit">Save changes</button>
        {saved && <span role="status" className="text-sm text-emerald-700">✓ Profile updated</span>}
      </div>
    </form>
  );
}
