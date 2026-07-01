import { LinkButton } from "@/components/ui/primitives";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-white blur-3xl" />
        <div className="absolute -right-4 bottom-0 h-72 w-72 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
          Property owners meet real estate agencies
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Post your property. Let agencies come to you.
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-blue-100 sm:text-xl">
          Owners create a profile and upload their selling request. Agencies
          browse listings, start a chat, and arrange in-person meetings — all
          inside Findly.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <LinkButton
            href="/signup/vendor"
            variant="secondary"
            className="min-w-[200px] px-8 py-3.5 text-base font-semibold shadow-lg"
          >
            I&apos;m a property owner
          </LinkButton>
          <LinkButton
            href="/signup/agency"
            variant="primary"
            className="min-w-[200px] border border-white/20 bg-white/10 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/20"
          >
            I&apos;m an agency
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
