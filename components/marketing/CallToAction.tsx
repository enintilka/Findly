export default function CallToAction() {
  return (
    <section id="get-started" className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-16 sm:px-12 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to flip the property search?
            </h2>
            <p className="mt-4 text-lg text-indigo-100">
              Whether you&apos;re searching for your next home or helping clients
              find the perfect match, Findly puts the customer first.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
            <a
              href="/customer/signup"
              className="group rounded-2xl bg-white p-8 text-left transition hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                For individuals
              </p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">
                I&apos;m looking for a property
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                Create your profile, describe your ideal property, and let
                agencies come to you.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition group-hover:gap-3">
                Get started
                <span aria-hidden="true">→</span>
              </span>
            </a>

            <a
              href="/agency/signup"
              className="group rounded-2xl border border-white/20 bg-white/10 p-8 text-left text-white transition hover:-translate-y-1 hover:bg-white/15"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-200">
                For agencies
              </p>
              <h3 className="mt-3 text-2xl font-bold">
                I&apos;m a real estate agency
              </h3>
              <p className="mt-3 leading-relaxed text-indigo-100">
                Browse customer requests, contact leads, and grow your business
                around real demand.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition group-hover:gap-3">
                Join as an agency
                <span aria-hidden="true">→</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
