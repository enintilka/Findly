"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import AgencyHeader from "@/components/agency/AgencyHeader";
import ListingPhotos from "@/components/agency/ListingPhotos";
import { AUTH_ROUTES } from "@/lib/auth-routes";
import { deleteAgencyListing, getAgencyListingById } from "@/lib/agency-store";
import { getListingImages } from "@/lib/listing-images";
import type { AgencyListing } from "@/types/agency";
import { Button } from "@/components/ui/primitives";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function ListingDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { agency } = useAgencyAuth();
  const [listing, setListing] = useState<AgencyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!agency) return;

    const refresh = async () => {
      setLoading(true);
      const entry = await getAgencyListingById(params.id);
      setListing(
        entry
          ? {
              ...entry,
              images: getListingImages(entry),
            }
          : null,
      );
      setLoading(false);
    };

    void refresh();
    window.addEventListener("findly-platform-change", refresh);
    return () => window.removeEventListener("findly-platform-change", refresh);
  }, [agency, params.id]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Loading property...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
        Property not found.
        <Link
          href="/agency/chat"
          className="mt-4 block text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          ← Back to messages
        </Link>
      </div>
    );
  }

  const location = [listing.city, listing.country].filter(Boolean).join(", ");
  const isOwner = listing.agencyId === agency?.id;

  async function handleDelete() {
    if (!agency || !listing || !isOwner || deleting) return;

    const confirmed = confirm(
      "Delete this property permanently? It will no longer appear in chat links or customer views.",
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteAgencyListing(agency.id, listing.id);
      router.push("/agency/dashboard");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this property.",
      );
      setDeleting(false);
    }
  }

  return (
    <article className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{listing.title}</h1>
            {location ? (
              <p className="mt-1 text-slate-500">{location}</p>
            ) : null}
            <p className="mt-1 text-sm text-slate-400">
              Listed {new Date(listing.createdAt).toLocaleDateString()}
            </p>
          </div>
          {isOwner ? (
            <Link
              href={`/agency/listings/${listing.id}/edit`}
              className="text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              Edit property
            </Link>
          ) : null}
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <p className="mt-6 text-2xl font-semibold text-violet-600">
          {formatCurrency(listing.price)}
        </p>

        <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {listing.description}
        </div>
      </div>

      <ListingPhotos listing={listing} />

      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/agency/dashboard"
          className="inline-block text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          ← Back to dashboard
        </Link>
        {isOwner ? (
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete property"}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export default function AgencyListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { agency, ready: agencyReady } = useAgencyAuth();
  const { customer, ready: customerReady } = useCustomerAuth();

  useEffect(() => {
    if (!customerReady || !customer) return;
    router.replace(`/customer/listings/${params.id}`);
  }, [customerReady, customer, params.id, router]);

  useEffect(() => {
    if (!agencyReady || !customerReady || agency || customer) return;
    router.replace(AUTH_ROUTES.agencyLogin);
  }, [agencyReady, customerReady, agency, customer, router]);

  if (!agencyReady || !customerReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (customer || !agency) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <>
      <AgencyHeader title="Property details" />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <ListingDetailContent />
        </div>
      </main>
    </>
  );
}
