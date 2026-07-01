"use client";

import AgencyHeader from "@/components/agency/AgencyHeader";
import AgencyProfileForm from "@/components/agency/AgencyProfileForm";
import { RequireAgency } from "@/components/agency/RequireAgency";

export default function AgencyProfileEditPage() {
  return (
    <>
      <AgencyHeader
        title="Edit agency profile"
        subtitle="Update your logo, description, and agency details."
      />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireAgency requireProfile>
          <div className="mx-auto max-w-3xl">
            <AgencyProfileForm mode="edit" />
          </div>
        </RequireAgency>
      </main>
    </>
  );
}
