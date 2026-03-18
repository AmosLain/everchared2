export const metadata = { title: "Terms of Use | EVMapFinder" };

export default function TermsPage() {
  return (
    <main className="min-h-screen text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Terms of Use</h1>

        <div className="mt-8 space-y-8 text-slate-300/82 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-50 mb-3">Service</h2>
            <p>
              EVMapFinder provides EV charging station information based on third-party sources.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-50 mb-3">No guarantee</h2>
            <p>
              Information is provided “AS IS” without warranties of accuracy, availability, or station functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-50 mb-3">User responsibility</h2>
            <p>
              You are responsible for verifying station availability, compatibility, access rules, pricing, and operating hours before relying on it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-50 mb-3">Limitation of liability</h2>
            <p>
              EVMapFinder is not liable for any damages, direct or indirect, resulting from use of the website, inaccurate data, or third-party service issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-50 mb-3">Third-party services</h2>
            <p>
              The website integrates services like Google Maps and OpenChargeMap. We are not responsible for their availability or policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-50 mb-3">Governing law</h2>
            <p>These terms are governed exclusively by the laws of the State of Israel.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-50 mb-3">Contact</h2>
            <p>
              Email: <a href="mailto:support@evmapfinder.com" className="text-teal-100 hover:text-white underline">support@evmapfinder.com</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
