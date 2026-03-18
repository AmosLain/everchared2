import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About EVMapFinder — Our Mission & Story",
  description:
    "EVMapFinder is an independent tool built to help EV drivers find charging stations worldwide. Learn about our mission, data sources, and how we can help you charge smarter.",
  alternates: { canonical: "https://www.evmapfinder.com/about" },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-12">

        <nav className="mb-8 text-sm text-slate-300/75">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-teal-100 transition-colors">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-slate-200/90">About</li>
          </ol>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            About EVMapFinder
          </h1>
          <p className="text-slate-300/78 text-lg leading-relaxed">
            A straightforward tool for finding EV charging stations — built by one developer, for everyday EV drivers.
          </p>
        </header>

        <section className="mb-10 space-y-4 text-slate-300/82 leading-relaxed">
          <h2 className="text-xl font-semibold text-slate-50">Why EVMapFinder exists</h2>
          <p>
            Finding a reliable EV charging station shouldn't require switching between multiple apps, dealing with cluttered interfaces, or signing up for yet another account. EVMapFinder was built with a single goal: give drivers a fast, clean way to find nearby charging points — without the noise.
          </p>
          <p>
            The project started as a personal tool and grew into a publicly accessible map finder covering over 150 cities across the United States, Europe, Israel, Asia, and Australia. It's maintained by a single independent developer, which means decisions are made quickly and the focus stays on what actually matters to users.
          </p>
        </section>

        <section className="mb-10 space-y-4 text-slate-300/82 leading-relaxed">
          <h2 className="text-xl font-semibold text-slate-50">How it works</h2>
          <p>
            EVMapFinder pulls live data from{" "}
            <a
              href="https://openchargemap.org"
              target="_blank"
              rel="noreferrer"
              className="text-teal-100 hover:text-white underline"
            >
              OpenChargeMap
            </a>
            , one of the largest open-source EV charging databases in the world. Station data is refreshed regularly and includes location coordinates, address details, and direct links to open each station in Google Maps for turn-by-turn navigation.
          </p>
          <p>
            The "Find near me" feature uses your device's GPS to automatically detect your location and surface the closest available charging stations — no account needed, no data stored on our end.
          </p>
          <p>
            For users who prefer browsing by destination, EVMapFinder offers dedicated city pages covering major metro areas worldwide, each with a curated list of charging stations within a defined radius of the city center.
          </p>
        </section>

        <section className="mb-10 space-y-4 text-slate-300/82 leading-relaxed">
          <h2 className="text-xl font-semibold text-slate-50">What we don't do</h2>
          <p>
            EVMapFinder doesn't require registration, doesn't sell your data, and doesn't show you irrelevant results to inflate numbers. Station data comes from a third-party source, which means occasional gaps or outdated entries may appear — we always recommend confirming availability before making a long detour.
          </p>
        </section>

        <section className="mb-10 space-y-4 text-slate-300/82 leading-relaxed">
          <h2 className="text-xl font-semibold text-slate-50">Coverage</h2>
          <p>
            EVMapFinder currently covers charging stations in over 150 cities across:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300/78">
            <li>United States — all major metro areas coast to coast</li>
            <li>Europe — UK, Germany, France, Netherlands, Scandinavia, and more</li>
            <li>Israel</li>
            <li>Canada, Australia, Japan, South Korea, Singapore</li>
            <li>UAE and other international cities</li>
          </ul>
          <p>
            Coverage is expanding regularly. If your city isn't listed yet, the homepage "Find near me" feature works anywhere in the world where OpenChargeMap has data.
          </p>
        </section>

        <section className="mb-10 space-y-4 text-slate-300/82 leading-relaxed">
          <h2 className="text-xl font-semibold text-slate-50">Contact</h2>
          <p>
            Questions, feedback, or data issues? Reach out at{" "}
            <a
              href="mailto:support@evmapfinder.com"
              className="text-teal-100 hover:text-white underline"
            >
              support@evmapfinder.com
            </a>
            . We read every message and respond as quickly as possible.
          </p>
        </section>

        <div className="border-t border-white/10 pt-8 flex flex-wrap gap-4 text-sm text-slate-300/75">
          <Link href="/" className="hover:text-teal-100 transition-colors">← Back to map</Link>
          <Link href="/privacy" className="hover:text-teal-100 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-teal-100 transition-colors">Terms of Use</Link>
        </div>

      </div>
    </main>
  );
}
