"use client";

/** Shown when the root layout itself fails (e.g. storefront config could not be loaded). */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 20 }}>This storefront is unavailable right now</h1>
          <p style={{ color: "#64748b" }}>Please try again in a moment.</p>
          <button onClick={reset} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
