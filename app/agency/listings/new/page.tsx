"use client";

import AgencyHeader from "@/components/agency/AgencyHeader";
import AgencyListingForm from "@/components/agency/AgencyListingForm";
import { RequireAgency } from "@/components/agency/RequireAgency";

export default function AgencyNewListingPage() {
  return (
    <>
      <AgencyHeader
        title="Add agency property"
        subtitle="Optional — list properties your agency represents."
      />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireAgency requireProfile>
          <div className="mx-auto max-w-3xl">
            <AgencyListingForm />
          </div>
        </RequireAgency>
      </main>
    </>
  );
}
