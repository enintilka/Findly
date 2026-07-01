import SectionHeading from "./SectionHeading";

const customerSteps = [
  "Create an account and complete your profile",
  "Publish requests describing your ideal property",
  "Add filters like budget, location, size, and amenities",
  "Wait for agencies to reach out through Findly chat",
  "Compare suggestions and arrange a meeting",
];

const agencySteps = [
  "Register and build your agency profile",
  "Browse, search, and filter customer requests",
  "Save interesting requests for later follow-up",
  "Contact customers when you have a suitable match",
  "Chat securely, share properties, and schedule meetings",
];

function WorkflowCard({
  title,
  subtitle,
  steps,
  accent,
  signupHref,
  signupLabel,
}: {
  title: string;
  subtitle: string;
  steps: string[];
  accent: "indigo" | "violet";
  signupHref: string;
  signupLabel: string;
}) {
  const accentStyles =
    accent === "indigo"
      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
      : "border-violet-200 bg-violet-50 text-violet-700";

  const buttonStyles =
    accent === "indigo"
      ? "bg-indigo-600 hover:bg-indigo-700"
      : "bg-violet-600 hover:bg-violet-700";

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <span
        className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${accentStyles}`}
      >
        {title}
      </span>
      <h3 className="mt-4 text-2xl font-bold text-slate-900">{subtitle}</h3>
      <ul className="mt-6 flex-1 space-y-4">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-slate-600">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
              {index + 1}
            </span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ul>
      <a
        href={signupHref}
        className={`mt-8 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white transition ${buttonStyles}`}
      >
        {signupLabel}
      </a>
    </article>
  );
}

export default function WorkflowCards() {
  return (
    <section id="workflows" className="bg-slate-50 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Two sides of the platform"
          title="Built for customers and agencies"
          description="Each role has a clear workflow designed around the reverse marketplace model."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <WorkflowCard
            title="Individual"
            subtitle="I'm looking for a property"
            steps={customerSteps}
            accent="indigo"
            signupHref="/customer/signup"
            signupLabel="Register as customer"
          />
          <WorkflowCard
            title="Agency"
            subtitle="I help customers find properties"
            steps={agencySteps}
            accent="violet"
            signupHref="/agency/signup"
            signupLabel="Register as agency"
          />
        </div>
      </div>
    </section>
  );
}
