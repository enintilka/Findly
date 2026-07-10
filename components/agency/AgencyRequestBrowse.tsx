"use client";

import { useEffect, useMemo, useState } from "react";
import AgencyRequestCard from "@/components/agency/AgencyRequestCard";
import { Input, Label, Select } from "@/components/ui/primitives";
import {
  filterRequests,
  getAllOpenRequests,
  getSavedRequestsForAgency,
} from "@/lib/agency-store";
import { PROPERTY_TYPE_LABELS, type CustomerRequest } from "@/types/customer";
import { EMPTY_REQUEST_FILTERS, type RequestFilters } from "@/types/agency";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";

type Tab = "all" | "saved";
type RequestSortOrder = "newest" | "oldest";

export default function AgencyRequestBrowse() {
  const { agency } = useAgencyAuth();
  const [tab, setTab] = useState<Tab>("all");
  const [sortOrder, setSortOrder] = useState<RequestSortOrder>("newest");
  const [filters, setFilters] = useState<RequestFilters>(EMPTY_REQUEST_FILTERS);
  const [allRequests, setAllRequests] = useState<CustomerRequest[]>([]);
  const [savedRequests, setSavedRequests] = useState<CustomerRequest[]>([]);

  useEffect(() => {
    const refresh = async () => {
      setAllRequests(await getAllOpenRequests());
      if (agency) setSavedRequests(await getSavedRequestsForAgency(agency.id));
    };
    void refresh();
    window.addEventListener("findly-platform-change", refresh);
    return () => window.removeEventListener("findly-platform-change", refresh);
  }, [agency]);

  const visibleRequests = useMemo(() => {
    const source = tab === "saved" ? savedRequests : allRequests;
    const filtered = filterRequests(source, filters);
    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [tab, savedRequests, allRequests, filters, sortOrder]);

  function updateFilter<Key extends keyof RequestFilters>(
    key: Key,
    value: RequestFilters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === "all"
              ? "bg-violet-600 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          All requests ({allRequests.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("saved")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === "saved"
              ? "bg-violet-600 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          Saved ({savedRequests.length})
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Search & filter
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Keywords, location, customer name..."
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="Italy"
              value={filters.country}
              onChange={(event) => updateFilter("country", event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Lucca"
              value={filters.city}
              onChange={(event) => updateFilter("city", event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="propertyType">Property type</Label>
            <Select
              id="propertyType"
              value={filters.propertyType}
              onChange={(event) =>
                updateFilter("propertyType", event.target.value)
              }
            >
              <option value="">All types</option>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="budgetMin">Budget min (€)</Label>
            <Input
              id="budgetMin"
              type="number"
              min={0}
              value={filters.budgetMin}
              onChange={(event) =>
                updateFilter("budgetMin", event.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor="budgetMax">Budget max (€)</Label>
            <Input
              id="budgetMax"
              type="number"
              min={0}
              value={filters.budgetMax}
              onChange={(event) =>
                updateFilter("budgetMax", event.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor="requestSort">Sort by</Label>
            <Select
              id="requestSort"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value as RequestSortOrder)
              }
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </Select>
          </div>
        </div>
      </div>

      {visibleRequests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-medium text-slate-900">No matching requests</p>
          <p className="mt-2 text-sm text-slate-600">
            {tab === "saved"
              ? "Save requests from the browse tab to review them later."
              : "Try adjusting your filters or check back when customers post new requests."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleRequests.map((request) => (
            <AgencyRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
