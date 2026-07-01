export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="inline-flex rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-200">
            The reverse property marketplace
          </p>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Describe what you want.{" "}
            <span className="text-indigo-300">Let agencies come to you.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            Findly is not another listing site. Customers publish their ideal
            property. Real estate agencies browse those requests and respond
            directly — no endless scrolling through thousands of listings.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="/customer/signup"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              I&apos;m looking for a property
            </a>
            <a
              href="/agency/signup"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
            >
              I&apos;m a real estate agency
            </a>
          </div>

          <p className="mt-8 text-sm text-slate-400">
            Customer need → Agency response. Demand comes first.
          </p>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                Live customer request
              </span>
              <span className="text-xs text-slate-400">Posted today</span>
            </div>

            <blockquote className="space-y-4 text-slate-200">
              <p className="text-lg font-medium text-white">
                &ldquo;Hi, I&apos;m Enea.&rdquo;
              </p>
              <p className="leading-relaxed text-slate-300">
                I&apos;m looking for a vacation house in Italy, preferably close
                to the sea. My budget is €130,000. I&apos;d like something between
                50 and 60 m² with two or three bedrooms.
              </p>
              <p className="leading-relaxed text-slate-400">
                A fireplace, garden, and swimming pool would be nice but are
                optional.
              </p>
            </blockquote>

            <div className="mt-6 flex flex-wrap gap-2">
              {["House", "Italy", "€130k", "2–3 beds", "Near sea"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Agencies see
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              Matching requests, not property catalogs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
