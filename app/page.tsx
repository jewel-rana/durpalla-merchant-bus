import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "@/components/BookingForm";
import { taka } from "@/lib/merchant";
import { getHome, getSite, type Offer } from "@/lib/site";
import { getCities, popularRoutes } from "@/lib/transport";

export const revalidate = 300;

const routeImages = ["/img/beach.jpg", "/img/ctg.jpg", "/img/tea.jpg", "/img/sea.jpg"];
const nextWeek = () => new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

export default async function Home() {
  const [merchant, home, cities] = await Promise.all([getSite(), getHome().catch(() => ({} as Record<string, unknown>)), getCities().catch(() => [])]);
  const routes = popularRoutes(home);
  const offers = ((home.offers as Offer[]) ?? []).slice(0, 3);
  const date = nextWeek();
  return (
    <>
      <section className="relative isolate">
        <Image src={merchant.heroImage ?? "/img/bus2.jpg"} alt={`${merchant.name} coach`} fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-dark/95 via-brand/80 to-brand/30" />
        <div className="mx-auto max-w-7xl px-4 pb-36 pt-12 md:px-8 md:pb-40 md:pt-20">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-orange-200">🚌 Intercity AC &amp; Non-AC coaches</p>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
            {merchant.banners[0]?.title || (merchant.tagline ? `${merchant.tagline} with ${merchant.name}` : merchant.name)}
          </h1>
          <p className="mt-4 max-w-xl text-white/85">{merchant.banners[0]?.subtitle || "Book bus tickets online in seconds. Choose your seat and pay securely."}</p>
        </div>
      </section>
      <div className="relative z-10 mx-auto -mt-28 max-w-7xl px-4 md:px-8">
        <BookingForm cities={cities} />
      </div>

      {routes.length > 0 && <section id="routes" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 md:px-8">
        <h2 className="mb-6 text-2xl font-bold">Popular routes</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {routes.map((r, i) => (
            <Link key={r.from + r.to} href={`/search?${new URLSearchParams({ from: r.from, to: r.to, date, passengers: "1" })}`}
              className="card group overflow-hidden p-3 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="relative h-36 overflow-hidden rounded-xl">
                <Image src={r.image ?? routeImages[i % routeImages.length]} alt={`${r.to}`} fill sizes="(min-width:1024px) 25vw, 100vw" className="object-cover transition group-hover:scale-105" />
              </div>
              <div className="px-1 pt-3">
                <p className="font-bold">{r.from} → {r.to}</p>
                {r.tripsPerDay > 0 && <p className="text-xs text-slate-500">Daily {r.tripsPerDay} trip{r.tripsPerDay > 1 ? "s" : ""}</p>}
                {r.fromFare != null && <p className="mt-2 font-bold text-accent">from {taka(r.fromFare)}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>}

      {offers.length > 0 && (
        <section id="offers" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-14 md:px-8">
          <h2 className="mb-6 text-2xl font-bold">Offers</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {offers.map((o) => (
              <article key={o.id} className="card overflow-hidden p-3">
                {o.image && <div className="relative h-40 overflow-hidden rounded-xl"><Image src={o.image} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" /></div>}
                <div className="px-1 pt-3">
                  <h3 className="font-bold">{o.title}</h3>
                  {o.subtitle && <p className="text-xs text-slate-500">{o.subtitle}</p>}
                  {o.code && <p className="mt-2 inline-block rounded-md bg-brand-light px-2 py-0.5 text-xs font-bold text-brand">Code {o.code}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {(merchant.apps.appStore || merchant.apps.googlePlay) && <section id="app" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-16 md:px-8">
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
                {merchant.apps.appStore && <a href={merchant.apps.appStore} className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 ring-1 ring-white/20" aria-label="Download on the App Store">
                  <span className="text-2xl" aria-hidden></span><span className="leading-tight"><span className="block text-[10px]">Download on the</span><span className="font-semibold">App Store</span></span>
                </a>}
                {merchant.apps.googlePlay && <a href={merchant.apps.googlePlay} className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 ring-1 ring-white/20" aria-label="Get it on Google Play">
                  <span className="text-xl" aria-hidden>▶</span><span className="leading-tight"><span className="block text-[10px]">GET IT ON</span><span className="font-semibold">Google Play</span></span>
                </a>}
              </div>
            </div>
            <div className="mx-auto hidden w-56 rounded-[2.2rem] border-[7px] border-slate-900 bg-white p-2 text-slate-900 shadow-2xl md:block">
              <div className="rounded-[1.6rem] bg-slate-50 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-brand"><span className="rounded bg-brand px-1 text-[9px] text-white">{merchant.logo.text}</span>{merchant.shortName}</div>
                <div className="relative h-24 overflow-hidden rounded-xl"><Image src={merchant.heroImage ?? "/img/bus2.jpg"} alt="" fill sizes="200px" className="object-cover" /></div>
                <div className="mt-2 space-y-1.5 text-[10px]">
                  <div className="rounded-lg bg-white p-2 shadow-sm"><span className="text-slate-400">FROM</span><br /><b>{routes[0]?.from ?? "—"}</b></div>
                  <div className="rounded-lg bg-white p-2 shadow-sm"><span className="text-slate-400">TO</span><br /><b>{routes[0]?.to ?? "—"}</b></div>
                  <div className="rounded-lg bg-accent p-2 text-center font-bold text-white">Search Buses</div>
                  {routes[1] && <div className="rounded-lg bg-white p-2 shadow-sm">{routes[1].from} → {routes[1].to}{routes[1].fromFare != null ? ` · ${taka(routes[1].fromFare)}` : ""}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>}
    </>
  );
}
