"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import { Button } from "@/components/ui/primitives";
import { getListingsPageForAgency } from "@/lib/agency-store";
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

export default function AgencyPropertyList() {
  const { agency } = useAgencyAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [listings, setListings] = useState<AgencyListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadPage = useCallback(
    async (page: number) => {
      if (!agency) return;
      setLoading(true);
      try {
        const result = await getListingsPageForAgency(
          agency.id,
          page,
          PROPERTIES_PER_PAGE,
        );
        setListings(result.listings);
        setTotal(result.total);
        setCurrentPage(result.page);
      } finally {
        setLoading(false);
      }
    },
    [agency],
  );

  useEffect(() => {
    void loadPage(currentPage);
  }, [loadPage, currentPage]);

  useEffect(() => {
    if (!agency) return;

    const refresh = () => {
      setCurrentPage(1);
      void loadPage(1);
    };

    window.addEventListener("findly-platform-change", refresh);
    return () => window.removeEventListener("findly-platform-change", refresh);
  }, [agency, loadPage]);

  const totalPages = Math.max(1, Math.ceil(total / PROPERTIES_PER_PAGE));
  const showingFrom =
    total === 0 ? 0 : (currentPage - 1) * PROPERTIES_PER_PAGE + 1;
  const showingTo = Math.min(currentPage * PROPERTIES_PER_PAGE, total);
  const hasMultiplePages = total > PROPERTIES_PER_PAGE;

  return (
    <section>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Your properties</h2>
        {total > 0 ? (
          <p className="mt-1 text-sm text-slate-500">
            {total} total · {PROPERTIES_PER_PAGE} per page
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading properties...
        </div>
      ) : total === 0 ? (
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
      ) : (
        <div className="mt-4 space-y-4" data-property-pagination>
          <div className="space-y-3">
            {listings.map((listing) => {
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
                      <h3 className="font-medium text-slate-900">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {[listing.city, listing.country]
                          .filter(Boolean)
                          .join(", ")}
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
                  Showing{" "}
                  <span className="font-medium text-slate-900">
                    {showingFrom}–{showingTo}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-900">{total}</span>{" "}
                  properties
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
              {total} propert{total === 1 ? "y" : "ies"}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
