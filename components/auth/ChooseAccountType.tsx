import Link from "next/link";
import { AUTH_ROUTES, type ChooseAccountMode } from "@/lib/auth-routes";

const copy = {
  login: {
    title: "Choose account type",
    subtitle:
      "Select how you use Findly to continue to the right sign-in page.",
    customerAction: "Continue as Customer",
    agencyAction: "Continue as Real Estate Agency",
    footer: "Don't have an account?",
    footerLink: "Register here",
    footerHref: AUTH_ROUTES.register,
  },
  register: {
    title: "Choose account type",
    subtitle:
      "Select how you want to use Findly to create the right account.",
    customerAction: "Continue as Customer",
    agencyAction: "Continue as Real Estate Agency",
    footer: "Already have an account?",
    footerLink: "Sign in here",
    footerHref: AUTH_ROUTES.chooseAccount,
  },
};

export default function ChooseAccountType({
  mode = "login",
}: {
  mode?: ChooseAccountMode;
}) {
  const content = copy[mode];
  const customerHref =
    mode === "login"
      ? AUTH_ROUTES.customerLogin
      : AUTH_ROUTES.customerSignup;
  const agencyHref =
    mode === "login" ? AUTH_ROUTES.agencyLogin : AUTH_ROUTES.agencySignup;

  return (
    <div>
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-4 text-lg text-slate-600">{content.subtitle}</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
        <Link
          href={customerHref}
          className="group rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Customer
          </span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            {content.customerAction}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {mode === "login"
              ? "Sign in to manage your property requests and messages."
              : "Create an account to describe what you're looking for."}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition group-hover:gap-3">
            Continue
            <span aria-hidden="true">→</span>
          </span>
        </Link>

        <Link
          href={agencyHref}
          className="group rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:border-violet-200 hover:shadow-md"
        >
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
            Real estate agency
          </span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            {content.agencyAction}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {mode === "login"
              ? "Sign in to browse customer requests and manage conversations."
              : "Create an agency account to find and contact potential clients."}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition group-hover:gap-3">
            Continue
            <span aria-hidden="true">→</span>
          </span>
        </Link>
      </div>

      <p className="mx-auto mt-10 max-w-md text-center text-sm text-slate-600">
        {content.footer}{" "}
        <Link href={content.footerHref} className="font-medium text-indigo-600">
          {content.footerLink}
        </Link>
      </p>
    </div>
  );
}
