import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";
import ConsentScripts from "./components/ConsentScripts";
import PWARegister from "./components/PWARegister";
import InstallBanner from "./components/InstallBanner";

export const metadata: Metadata = {
  title: "EV Charging Stations Map — Find Chargers Near You | EVMapFinder",
  description:
    "Search and discover electric vehicle charging stations worldwide. Filter by location, power type, and network. Find the nearest EV charger with one click.",
  alternates: {
    canonical: "https://www.evmapfinder.com",
  },
  openGraph: {
    title: "EV Charging Stations Map — Find Chargers Near You | EVMapFinder",
    description:
      "Discover EV charging stations near you. Search by city, name, or network.",
    type: "website",
    url: "https://www.evmapfinder.com",
    images: [
      {
        url: "https://www.evmapfinder.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "EVMapFinder - EV Charging Stations Map",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  // PWA manifest
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EVMapFinder",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "EVMapFinder",
    url: "https://www.evmapfinder.com",
    description:
      "Find EV charging stations worldwide. Search by city, address, or use your current location.",
    applicationCategory: "TravelApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="en" translate="no">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Google AdSense — Auto Ads */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6510652100353402"
          crossOrigin="anonymous"
        />

        {/* PWA — iOS icons */}
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png" />
        <meta name="theme-color" content="#14b8a6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="EVMapFinder" />
      </head>

      <body className="min-h-screen text-slate-100 flex flex-col">

        {/* Register Service Worker */}
        <PWARegister />

        {/* תוכן האתר */}
        <main className="flex-1">
          {children}
        </main>

        {/* פוטר גלובלי */}
        <footer className="border-t border-white/10 bg-[#121924]/78 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-200">
            <div className="flex flex-wrap gap-6">
              <a href="/about" className="text-slate-100/90 hover:text-white hover:underline transition-colors">About</a>
              <a href="/privacy" className="text-slate-100/90 hover:text-white hover:underline transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-slate-100/90 hover:text-white hover:underline transition-colors">Terms of Use</a>
              <a href="mailto:support@evmapfinder.com" className="text-slate-100/90 hover:text-white hover:underline transition-colors">Contact</a>
            </div>
            <p className="mt-4 text-slate-300/75 max-w-3xl leading-relaxed">
              EV charging station data is provided by third-party sources and may
              not always be accurate or up to date. Always verify availability,
              compatibility, and access rules before relying on it.
            </p>
            <p className="mt-3 text-xs text-slate-400/75">
              © {new Date().getFullYear()} EVMapFinder
            </p>
          </div>
        </footer>

        {/* PWA Install Banner */}
        <InstallBanner />

        {/* קוקיז + טעינת סקריפטים אחרי אישור */}
        <CookieBanner />
        <ConsentScripts />

      </body>
    </html>
  );
}
