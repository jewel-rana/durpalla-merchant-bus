"use client";
import { useState } from "react";
import { submitReview } from "@/lib/auth-actions";

/** Shown on a completed, paid booking when the API says `canReview`. */
export function ReviewForm({ bookingId, hotelId }: { bookingId: string; hotelId?: string }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState("");
  if (state === "done") return <p role="status" className="card p-5 text-sm text-emerald-700">✓ Thanks for your review!</p>;
  return (
    <form className="card space-y-3 p-5" onSubmit={async (e) => {
      e.preventDefault();
      if (hotelId && text.trim().length < 3) return setErr("Please write a few words about your stay.");
      setState("busy"); setErr("");
      const r = await submitReview({ bookingId, hotelId, rating, text: text.trim() });
      if (r.ok) setState("done"); else { setState("idle"); setErr(r.message); }
    }}>
      <h2 className="font-bold">Rate your experience</h2>
      <div role="radiogroup" aria-label="Rating" className="flex gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)}
            className={n <= rating ? "text-amber-400" : "text-slate-300"}>★</button>
        ))}
      </div>
      <label className="label" htmlFor="review">Your review{hotelId ? "" : " (optional)"}</label>
      <textarea id="review" className="field min-h-24" maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} />
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <button className="btn-accent" type="submit" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Submit review"}</button>
    </form>
  );
}
