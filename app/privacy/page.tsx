export const metadata = { title: "Privacy Policy | EVMapFinder" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-slate-300/78"><strong>Last updated:</strong> {new Date().toISOString().slice(0, 10)}</p>

        <div className="mt-8 space-y-8 text-slate-300/82 leading-relaxed">
          <section>
            <p>EVMapFinder (“we”, “our”, “the website”) respects your privacy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-50 mb-3">What we collect</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-300/78">
              <li>Approximate location, only if you click “Find near me” and allow it</li>
              <li>Usage data via analytics or advertising tools</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-50 mb-3">Location</h2>
            <p>
              Location is accessed only with your permission through your browser and used to show nearby charging stations.
              We do not store your precise location.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-50 mb-3">Third-party services</h2>
            <p>
              We may use third-party services such as Google Maps, OpenChargeMap, analytics providers, and advertising providers.
              These services may process data under their own policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-50 mb-3">Cookies</h2>
            <p>
              Cookies may be used for analytics and advertising. You can manage cookies in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-50 mb-3">GDPR / EEA users</h2>
            <p>
              If you are in the EEA, you may have rights such as access, deletion, objection, and portability.
              Since we do not provide user accounts, many requests can be handled by clearing your browser data.
            </p>
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
