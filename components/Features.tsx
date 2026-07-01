const ownerSteps = [
  {
    title: "Create your profile",
    description:
      "Sign up as a property owner, add your contact details, and tell agencies about your property goals.",
  },
  {
    title: "Upload your request",
    description:
      "Post what you want to sell — location, price, photos, and timeline — then wait for interest.",
  },
  {
    title: "Chat and meet in person",
    description:
      "Review agency messages, compare proposals in chat, and schedule an in-person meeting when ready.",
  },
];

const agencySteps = [
  {
    title: "Build your agency profile",
    description:
      "Showcase your company, license, and portfolio so owners know who they're talking to.",
  },
  {
    title: "Search owner requests",
    description:
      "Browse the main feed of properties owners have posted and filter by city or type.",
  },
  {
    title: "Reach out and close",
    description:
      "Start a conversation in-app, propose your services, and arrange a meeting to win the listing.",
  },
];

function StepCard({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
        {index}
      </div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-3 leading-relaxed text-gray-600">{description}</p>
    </article>
  );
}

export default function Features() {
  return (
    <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-20">
        <div>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              For property owners
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Upload your request once and let qualified agencies approach you.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {ownerSteps.map((step, index) => (
              <StepCard key={step.title} index={index + 1} {...step} />
            ))}
          </div>
        </div>

        <div>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              For real estate agencies
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Find motivated sellers, start conversations, and grow your pipeline.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {agencySteps.map((step, index) => (
              <StepCard key={step.title} index={index + 1} {...step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
