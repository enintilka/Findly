"use client";

import AgencyDashboardContent from "@/components/agency/AgencyDashboardContent";
import AgencyHeader from "@/components/agency/AgencyHeader";
import { RequireAgency } from "@/components/agency/RequireAgency";

export default function AgencyDashboardPage() {
  return (
    <>
      <AgencyHeader
        title="Agency dashboard"
        subtitle="Browse customer requests, save leads, and start conversations."
      />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireAgency requireProfile>
          <div className="mx-auto max-w-6xl">
            <AgencyDashboardContent />
          </div>
        </RequireAgency>
      </main>
    </>
  );
}
