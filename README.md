# Merchant Website – Bus (white-label) · Powered by Durpalla Limited

Next.js 16 (App Router, TypeScript, Tailwind CSS v4) storefront for bus operators on the Durpalla OTA platform.

## Run
```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3000
npm run build && npm start
```

## Configure a merchant
* `lib/merchant.ts` – add an entry to `merchants` (name, short name, logo text/src, colors, contact, domain, app links, hero image) and point `NEXT_PUBLIC_MERCHANT_ID` at it.
* Brand colors become CSS variables (`--brand`, `--brand-dark`, `--brand-light`, `--accent`, `--accent-dark`) set on `<html>` in `app/layout.tsx`, and are mapped to Tailwind colors (`bg-brand`, `text-accent`…) in `app/globals.css`.
* `proxy.ts` (Next 16's replacement for middleware) maps hostname → merchant id via `hostMap` and forwards `x-merchant-id`. This is a stub for multi-tenant hosting.
* SEO metadata (title template, description, OpenGraph, theme color) is generated from the merchant config.

## Data / API
* `lib/types.ts` holds the typed models (Trip, SeatMap, Booking, Passenger, PaymentInit, Customer…).
* `lib/api.ts` defines the `BookingApi` interface, `httpApi` (REST against `NEXT_PUBLIC_API_BASE_URL`, `X-Merchant-Id` header, bearer token), and `mockApi` (default).
* Set `NEXT_PUBLIC_API_BASE_URL=https://api.durpalla…` and `NEXT_PUBLIC_USE_MOCK=false` to use the real backend. Endpoint paths in `httpApi` are proposals, so align them with the Durpalla API.
* Payment: `initiatePayment()` should return the gateway (bKash/Nagad/Rocket/SSL card) redirect URL. The mock returns the confirmation page.

## Routes
`/` · `/search` · `/trip/[id]/seats` · `/checkout` · `/booking/[id]/confirmation` · `/login` · `/account` · `/account/bookings` · `/account/bookings/[id]` · `/account/invoices/[id]` (printable) · `/account/profile`
