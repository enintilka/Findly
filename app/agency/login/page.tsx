"use client";

import Link from "next/link";
import AgencyHeader from "@/components/agency/AgencyHeader";
import AgencyLoginForm from "@/components/agency/AgencyLoginForm";
import { RedirectIfAgency } from "@/components/agency/RequireAgency";
import { AUTH_ROUTES } from "@/lib/auth-routes";

export default function AgencyLoginPage() {
  return (
    <RedirectIfAgency>
      <AgencyHeader />
      <main className="bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
            Agency sign in
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Welcome back</h1>
          <div className="mt-8">
            <AgencyLoginForm />
          </div>
          <p className="mt-6 text-center">
            <Link
              href={AUTH_ROUTES.chooseAccount}
              className="text-sm font-medium text-slate-500 hover:text-violet-600"
            >
              ← Choose a different account type
            </Link>
          </p>
        </div>
      </main>
    </RedirectIfAgency>
  );
}
