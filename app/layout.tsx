import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { merchantCssVars } from "@/lib/merchant";
import { getSite } from "@/lib/site";
import { SiteProvider } from "@/lib/site-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const m = await getSite();
  const base = m.domain ? new URL(`https://${m.domain}`) : undefined;
  return {
    metadataBase: base,
    title: { default: m.seo.title || `${m.name} | Online Bus Tickets`, template: `%s | ${m.name}` },
    description: m.seo.description || `Book ${m.name} bus tickets online. Choose your seat and pay securely.`,
    keywords: m.seo.keywords,
    icons: m.favicon ? { icon: m.favicon } : undefined,
    openGraph: { siteName: m.name, type: "website", images: [m.seo.image || m.heroImage].filter((x): x is string => Boolean(x)) },
  };
}

export async function generateViewport(): Promise<Viewport> {
  return { themeColor: (await getSite()).colors.primary };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const merchant = await getSite();
  return (
    <html lang={merchant.locale === "bn" ? "bn" : "en"} className={inter.variable} style={merchantCssVars(merchant) as React.CSSProperties}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <SiteProvider value={merchant}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2">Skip to content</a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        </SiteProvider>
      </body>
    </html>
  );
}
