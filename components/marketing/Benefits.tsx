import SectionHeading from "./SectionHeading";

const benefits = [
  {
    title: "No listing overload",
    description:
      "Customers stop scrolling through thousands of properties. They describe what they want once and let qualified agencies respond.",
  },
  {
    title: "Better matches",
    description:
      "Agencies review detailed requests with filters for budget, location, amenities, and more — so outreach is relevant from the start.",
  },
  {
    title: "Privacy by design",
    description:
      "Conversations happen inside Findly. Personal phone numbers and email addresses stay protected until both sides choose to share more.",
  },
  {
    title: "Agencies stay competitive",
    description:
      "Agencies can still upload their available properties, but the platform prioritizes responding to real customer demand.",
  },
  {
    title: "Rich request details",
    description:
      "Requests support optional filters, notes, images, and PDFs — giving agencies everything they need to evaluate a fit quickly.",
  },
  {
    title: "Meetings made easy",
    description:
      "Chat makes it simple to share suggestions, answer questions, and arrange online or in-person meetings within the platform.",
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Why Findly"
          title="A marketplace focused on demand"
          description="Traditional portals start with supply. Findly starts with what the customer actually needs."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-2xl border border-slate-200 p-6 transition hover:border-indigo-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{benefit.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
