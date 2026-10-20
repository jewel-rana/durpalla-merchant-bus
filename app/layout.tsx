import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { merchant, merchantCssVars } from "@/lib/merchant";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(`https://${merchant.domain}`),
  title: { default: `${merchant.name} | Online Bus Tickets`, template: `%s | ${merchant.name}` },
  description: `Book ${merchant.name} bus tickets online. Choose your seat, pay with bKash, Nagad, Rocket or card.`,
  openGraph: { siteName: merchant.name, type: "website", images: [merchant.heroImage] },
};

export const viewport: Viewport = { themeColor: merchant.colors.primary };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} style={merchantCssVars() as React.CSSProperties}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2">Skip to content</a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
