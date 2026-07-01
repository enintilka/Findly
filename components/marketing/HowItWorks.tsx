import SectionHeading from "./SectionHeading";

const steps = [
  {
    number: "01",
    title: "Customer describes their ideal property",
    description:
      "Individuals create a profile and publish one or more detailed requests — location, budget, size, amenities, and personal notes.",
  },
  {
    number: "02",
    title: "Agencies browse and filter requests",
    description:
      "Registered agencies search customer needs, save interesting requests, and identify properties from their portfolio that could be a match.",
  },
  {
    number: "03",
    title: "Both sides connect inside Findly",
    description:
      "Agencies contact customers through secure in-app chat, share suggestions, and arrange online or in-person meetings — without exposing personal contact details upfront.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="How it works"
          title="Demand first. Supply responds."
          description="Findly flips the traditional real estate model. Customers publish what they need. Agencies compete to help them find it."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="relative rounded-2xl border border-slate-200 bg-slate-50 p-8"
            >
              <span className="text-4xl font-bold text-indigo-100">{step.number}</span>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-indigo-100 bg-indigo-50 px-6 py-5 text-center sm:px-10">
          <p className="text-base font-medium text-indigo-900">
            Not: Agency → Property → Customer
          </p>
          <p className="mt-1 text-lg font-semibold text-indigo-700">
            Instead: Customer Need → Agency Response
          </p>
        </div>
      </div>
    </section>
  );
}
