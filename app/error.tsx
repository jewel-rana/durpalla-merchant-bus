"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="card mx-auto my-16 max-w-xl p-8 text-center">
      <p className="text-lg font-bold text-red-600">We couldn&apos;t load this page</p>
      <p className="mt-2 text-sm text-slate-500">{error.message && !error.digest ? error.message : "The booking service did not respond. Please try again."}</p>
      <button type="button" onClick={reset} className="btn-accent mt-5">Try again</button>
    </div>
  );
}
