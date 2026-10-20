import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "@/components/BookingForm";
import { merchant, taka } from "@/lib/merchant";
import { api } from "@/lib/api";

const amenities = [
  { img: "/img/bus.jpg", icon: "❄️", t: "Full AC", d: "Climate controlled" },
  { img: "/img/seats.jpg", icon: "🔌", t: "USB charging", d: "Every seat" },
  { img: "/img/wifi.jpg", icon: "📶", t: "Free Wi-Fi", d: "On premium coaches" },
  { img: "/img/road.jpg", icon: "📍", t: "Live tracking", d: "Share your trip" },
];
const extraAmenities = ["💺 Reclining seats", "🎥 CCTV", "💧 Water", "🧺 Blanket", "🛰️ GPS", "🚻 Rest stops"];
const stats = [{ v: "120+", l: "Coaches" }, { v: "35", l: "Routes" }, { v: "2M+", l: "Happy travellers" }, { v: "4.7★", l: "Avg rating" }];
const classes = [
  { img: "/img/eco.jpg", t: "Economy (Non-AC)", s: "2+2 seating · 40 seats", tags: ["Reclining", "Water"], fare: 700 },
  { img: "/img/biz.jpg", t: "Business (AC)", s: "2+1 seating · 30 seats", tags: ["Snacks", "Blanket", "USB"], fare: 1200, popular: true },
  { img: "/img/sleep.jpg", t: "Sleeper", s: "1+1 berths · 18 beds", tags: ["Flat bed", "Wi-Fi"], fare: 2500 },
];

export default async function Home() {
  const routes = await api.getPopularRoutes();
  return (
    <>
      <section className="relative isolate">
        <Image src={merchant.heroImage} alt="Green Line coach on the highway" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-dark/95 via-brand/80 to-brand/30" />
        <div className="mx-auto max-w-7xl px-4 pb-36 pt-12 md:px-8 md:pb-40 md:pt-20">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-orange-200">🚌 Intercity AC &amp; Non-AC coaches</p>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
            {merchant.tagline} with {merchant.name}
          </h1>
          <p className="mt-4 max-w-xl text-white/85">Book bus tickets online in seconds. Choose your seat, pay with bKash, Nagad or card.</p>
        </div>
      </section>
      <div className="relative z-10 mx-auto -mt-28 max-w-7xl px-4 md:px-8">
        <BookingForm />
      </div>

      <section id="routes" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 md:px-8">
        <h2 className="mb-6 text-2xl font-bold">Popular routes</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {routes.map((r) => (
            <Link key={r.from + r.to} href={`/search?${new URLSearchParams({ from: r.from, to: r.to, date: "2026-10-24", passengers: "1" })}`}
              className="card group overflow-hidden p-3 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="relative h-36 overflow-hidden rounded-xl">
                <Image src={r.image} alt={`${r.to}`} fill sizes="(min-width:1024px) 25vw, 100vw" className="object-cover transition group-hover:scale-105" />
              </div>
              <div className="px-1 pt-3">
                <p className="font-bold">{r.from} → {r.to}</p>
                <p className="text-xs text-slate-500">{r.duration} · Daily {r.tripsPerDay} trips</p>
                <p className="mt-2 font-bold text-accent">from {taka(r.fromFare)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="fleet" className="scroll-mt-16 bg-gradient-to-br from-brand-dark to-brand py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-300">Our fleet</p>
              <h2 className="mt-1 text-2xl font-bold md:text-3xl">Our fleet &amp; amenities</h2>
              <p className="mt-2 max-w-lg text-white/75">Modern Hino, Scania &amp; Volvo coaches, serviced after every trip.</p>
            </div>
            <dl className="grid grid-cols-4 gap-3 text-center md:gap-6">
              {stats.map((s) => (
                <div key={s.l}><dt className="sr-only">{s.l}</dt><dd className="text-xl font-extrabold md:text-2xl">{s.v}</dd><p className="text-[11px] text-white/70 md:text-xs">{s.l}</p></div>
              ))}
            </dl>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {amenities.map((a) => (
              <div key={a.t} className="overflow-hidden rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
                <div className="relative h-28 overflow-hidden rounded-xl md:h-36">
                  <Image src={a.img} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
                </div>
                <p className="mt-3 font-semibold">{a.icon} {a.t}</p>
                <p className="text-xs text-white/70">{a.d}</p>
              </div>
            ))}
          </div>
          <ul className="mt-6 flex flex-wrap gap-2 text-sm">
            {extraAmenities.map((x) => <li key={x} className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">{x}</li>)}
          </ul>
        </div>
      </section>

      <section id="classes" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 md:px-8">
        <h2 className="mb-6 text-2xl font-bold">Choose your seat class</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {classes.map((c) => (
            <article key={c.t} className={`card relative overflow-hidden p-3 ${c.popular ? "ring-2 ring-accent" : ""}`}>
              {c.popular && <span className="absolute right-5 top-5 z-10 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">Most Popular</span>}
              <div className="relative h-40 overflow-hidden rounded-xl"><Image src={c.img} alt={`${c.t} coach`} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" /></div>
              <div className="px-1 pt-3">
                <h3 className="font-bold">{c.t}</h3>
                <p className="text-xs text-slate-500">{c.s}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">{c.tags.map((t) => <span key={t} className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand">{t}</span>)}</div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-extrabold text-accent">{taka(c.fare)}+</p>
                  <Link href="/search" className="btn-accent !px-4 !py-1.5 text-sm">Select</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="app" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-16 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark to-[#1d4ed8] p-8 text-white md:p-14">
          <div className="grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-300">Get the app</p>
              <h2 className="mt-2 text-2xl font-bold md:text-4xl">Book faster with the {merchant.name} app</h2>
              <ul className="mt-5 space-y-2 text-white/85">
                <li>🎟️ Instant e-tickets &amp; live seat selection</li>
                <li>📍 Live bus tracking &amp; trip alerts</li>
                <li>💸 App-only offers, pay with bKash/Nagad/card</li>
              </ul>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a href={merchant.apps.appStore} className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 ring-1 ring-white/20" aria-label="Download on the App Store">
                  <span className="text-2xl" aria-hidden></span><span className="leading-tight"><span className="block text-[10px]">Download on the</span><span className="font-semibold">App Store</span></span>
                </a>
                <a href={merchant.apps.googlePlay} className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 ring-1 ring-white/20" aria-label="Get it on Google Play">
                  <span className="text-xl" aria-hidden>▶</span><span className="leading-tight"><span className="block text-[10px]">GET IT ON</span><span className="font-semibold">Google Play</span></span>
                </a>
                <figure className="text-center">
                  <div className="grid h-20 w-20 grid-cols-5 gap-0.5 rounded-lg bg-white p-1.5" role="img" aria-label="QR code placeholder">
                    {Array.from({ length: 25 }, (_, i) => <span key={i} className={[0, 1, 3, 4, 5, 7, 9, 12, 14, 15, 19, 20, 21, 22, 24].includes(i) ? "bg-slate-900" : ""} />)}
                  </div>
                  <figcaption className="mt-1 text-[10px] text-white/70">Scan to download</figcaption>
                </figure>
              </div>
            </div>
            <div className="mx-auto hidden w-56 rounded-[2.2rem] border-[7px] border-slate-900 bg-white p-2 text-slate-900 shadow-2xl md:block">
              <div className="rounded-[1.6rem] bg-slate-50 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-brand"><span className="rounded bg-brand px-1 text-[9px] text-white">{merchant.logo.text}</span>{merchant.shortName}</div>
                <div className="relative h-24 overflow-hidden rounded-xl"><Image src="/img/bus2.jpg" alt="" fill sizes="200px" className="object-cover" /></div>
                <div className="mt-2 space-y-1.5 text-[10px]">
                  <div className="rounded-lg bg-white p-2 shadow-sm"><span className="text-slate-400">FROM</span><br /><b>Dhaka</b></div>
                  <div className="rounded-lg bg-white p-2 shadow-sm"><span className="text-slate-400">TO</span><br /><b>Cox&apos;s Bazar</b></div>
                  <div className="rounded-lg bg-accent p-2 text-center font-bold text-white">Search Buses</div>
                  <div className="rounded-lg bg-white p-2 shadow-sm">Dhaka → Chattogram · ৳800</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
