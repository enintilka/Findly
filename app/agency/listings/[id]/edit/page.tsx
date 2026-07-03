"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import AgencyHeader from "@/components/agency/AgencyHeader";
import AgencyListingForm from "@/components/agency/AgencyListingForm";
import { RequireAgency } from "@/components/agency/RequireAgency";
import { getAgencyListingById } from "@/lib/agency-store";
import { getListingImages } from "@/lib/listing-images";
import type { AgencyListing } from "@/types/agency";

function EditListingContent() {
  const params = useParams<{ id: string }>();
  const { agency } = useAgencyAuth();
  const [listing, setListing] = useState<AgencyListing | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!agency) return;

    const refresh = async () => {
      const entry = await getAgencyListingById(params.id);
      if (!entry || entry.agencyId !== agency.id) {
        setListing(null);
        return;
      }

      setListing({
        ...entry,
        images: getListingImages(entry),
      });
    };

    void refresh();
    window.addEventListener("findly-platform-change", refresh);
    return () => window.removeEventListener("findly-platform-change", refresh);
  }, [agency, params.id]);

  if (listing === undefined) {
    return null;
  }

  if (!listing) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
        Property not found.
        <Link
          href="/agency/dashboard"
          className="mt-4 block text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return <AgencyListingForm listing={listing} />;
}

export default function EditAgencyListingPage() {
  return (
    <>
      <AgencyHeader
        title="Edit property"
        subtitle="Update details or photos for this listing."
      />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireAgency requireProfile>
          <div className="mx-auto max-w-3xl">
            <EditListingContent />
          </div>
        </RequireAgency>
      </main>
    </>
  );
}
