"use client";

import AgencyHeader from "@/components/agency/AgencyHeader";
import AgencyProfileForm from "@/components/agency/AgencyProfileForm";
import { RequireAgency } from "@/components/agency/RequireAgency";

export default function AgencyProfilePage() {
  return (
    <>
      <AgencyHeader
        title="Complete your agency profile"
        subtitle="Tell customers about your agency before you start reaching out."
      />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireAgency>
          <div className="mx-auto max-w-3xl">
            <AgencyProfileForm />
          </div>
        </RequireAgency>
      </main>
    </>
  );
}
