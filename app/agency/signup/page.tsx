"use client";

import AgencyHeader from "@/components/agency/AgencyHeader";
import AgencySignupForm from "@/components/agency/AgencySignupForm";
import { RedirectIfAgency } from "@/components/agency/RequireAgency";

export default function AgencySignupPage() {
  return (
    <RedirectIfAgency>
      <AgencyHeader />
      <main className="bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
            Real estate agency
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Join Findly as an agency
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Browse customer requests and respond to real demand.
          </p>
          <div className="mt-8">
            <AgencySignupForm />
          </div>
        </div>
      </main>
    </RedirectIfAgency>
  );
}
