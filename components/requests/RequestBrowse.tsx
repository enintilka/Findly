"use client";

import { useEffect, useState } from "react";
import RequestCard from "@/components/requests/RequestCard";
import { Input } from "@/components/ui/primitives";
import { getOpenRequests } from "@/lib/store";
import type { PropertyRequest } from "@/types";

export default function RequestBrowse() {
  const [city, setCity] = useState("");
  const [requests, setRequests] = useState<PropertyRequest[]>([]);

  useEffect(() => {
    setRequests(getOpenRequests(city));

    const refresh = () => setRequests(getOpenRequests(city));
    window.addEventListener("findly-data-change", refresh);
    return () => window.removeEventListener("findly-data-change", refresh);
  }, [city]);

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Owner requests
            </h2>
            <p className="mt-2 max-w-2xl text-gray-600">
              Agencies can search what property owners have posted and reach out
              directly through Findly chat.
            </p>
          </div>

          <div className="w-full max-w-sm">
            <Input
              type="text"
              placeholder="Filter by city..."
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <p className="text-lg font-medium text-gray-900">No requests found</p>
            <p className="mt-2 text-gray-600">
              Try another city or check back when owners post new properties.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
