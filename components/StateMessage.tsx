import Link from "next/link";

/** Shared empty / error / "coming soon" block, styled like the site cards. */
export function StateMessage({ title, body, action, tone = "neutral" }: { title: string; body?: string; action?: { href: string; label: string }; tone?: "neutral" | "error" }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className="card mx-auto my-6 max-w-xl p-8 text-center">
      <p className={`text-lg font-bold ${tone === "error" ? "text-red-600" : "text-slate-800"}`}>{title}</p>
      {body && <p className="mt-2 text-sm text-slate-500">{body}</p>}
      {action && <Link href={action.href} className="btn-accent mt-5 inline-flex">{action.label}</Link>}
    </div>
  );
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-4 px-4 py-8 md:px-8" aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => <div key={i} className="card h-24 bg-slate-100" />)}
    </div>
  );
}

export function ComingSoon({ what }: { what: string }) {
  return <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">{what}: coming soon</p>;
}
