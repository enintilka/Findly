"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/primitives";
import { getListingImages } from "@/lib/listing-images";
import type { AgencyListing } from "@/types/agency";

const PROPERTIES_PER_PAGE = 5;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AgencyPropertyList({
  listings,
}: {
  listings: AgencyListing[];
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedListings = useMemo(() => {
    return [...listings].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [listings]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedListings.length / PROPERTIES_PER_PAGE),
  );

  const pageListings = useMemo(() => {
    const start = (currentPage - 1) * PROPERTIES_PER_PAGE;
    return sortedListings.slice(start, start + PROPERTIES_PER_PAGE);
  }, [sortedListings, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [listings.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (listings.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm text-slate-600">
          No listings yet. Add properties your agency represents.
        </p>
        <Link
          href="/agency/listings/new"
          className="mt-3 inline-block text-sm font-medium text-violet-600"
        >
          Add a property
        </Link>
      </div>
    );
  }

  const showingFrom = (currentPage - 1) * PROPERTIES_PER_PAGE + 1;
  const showingTo = Math.min(
    currentPage * PROPERTIES_PER_PAGE,
    sortedListings.length,
  );
  const hasMultiplePages = sortedListings.length > PROPERTIES_PER_PAGE;

  return (
    <div className="mt-4 space-y-4" data-property-pagination>
      <div className="space-y-3">
        {pageListings.map((listing) => {
          const cover = getListingImages(listing)[0];
          return (
            <article
              key={listing.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex gap-4">
                {cover?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover.url}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-xs text-violet-400">
                    No photo
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-slate-900">{listing.title}</h3>
                  <p className="text-sm text-slate-500">
                    {[listing.city, listing.country].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-1 font-semibold text-violet-600">
                    {formatCurrency(listing.price)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    <Link
                      href={`/agency/listings/${listing.id}`}
                      className="font-medium text-violet-600 hover:text-violet-700"
                    >
                      View
                    </Link>
                    <Link
                      href={`/agency/listings/${listing.id}/edit`}
                      className="font-medium text-slate-600 hover:text-slate-900"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {hasMultiplePages ? (
        <nav
          aria-label="Property pages"
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Showing <span className="font-medium text-slate-900">{showingFrom}–{showingTo}</span> of{" "}
              <span className="font-medium text-slate-900">{sortedListings.length}</span> properties
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <Button
                    key={page}
                    type="button"
                    variant={page === currentPage ? "violet" : "secondary"}
                    onClick={() => setCurrentPage(page)}
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {page}
                  </Button>
                ),
              )}
              <Button
                type="button"
                variant="secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </nav>
      ) : (
        <p className="text-sm text-slate-500">
          {sortedListings.length} propert{sortedListings.length === 1 ? "y" : "ies"}
        </p>
      )}
    </div>
  );
}
