"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import { Button } from "@/components/ui/primitives";
import {
  isRequestSaved,
  startChatWithCustomer,
  toggleSavedRequest,
} from "@/lib/agency-store";
import {
  AMENITY_LABELS,
  PROPERTY_TYPE_LABELS,
  type CustomerRequest,
} from "@/types/customer";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AgencyRequestCard({
  request,
}: {
  request: CustomerRequest;
}) {
  const router = useRouter();
  const { agency } = useAgencyAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!agency) return;
    const refresh = () => setSaved(isRequestSaved(agency.id, request.id));
    refresh();
    window.addEventListener("findly-platform-change", refresh);
    return () => window.removeEventListener("findly-platform-change", refresh);
  }, [agency, request.id]);

  function handleSave() {
    if (!agency) return;
    setSaved(toggleSavedRequest(agency.id, request.id));
  }

  function handleContact() {
    if (!agency) return;
    const thread = startChatWithCustomer(agency, request);
    router.push(`/agency/chat/${thread.id}`);
  }

  const activeAmenities = (
    Object.keys(request.amenities) as Array<keyof typeof request.amenities>
  ).filter((key) => request.amenities[key]);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
            {PROPERTY_TYPE_LABELS[request.propertyType]}
          </span>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            {request.city}, {request.region}
          </h3>
          <p className="text-sm text-slate-500">
            {request.country} · {request.customerName} ·{" "}
            {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            saved
              ? "bg-amber-50 text-amber-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
        {request.introduction}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          {formatCurrency(request.budgetMin)} – {formatCurrency(request.budgetMax)}
        </span>
        {request.bedrooms ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {request.bedrooms} beds
          </span>
        ) : null}
        {request.sizeMin || request.sizeMax ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {request.sizeMin ?? "?"}–{request.sizeMax ?? "?"} m²
          </span>
        ) : null}
      </div>

      {activeAmenities.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeAmenities.slice(0, 4).map((key) => (
            <span
              key={key}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600"
            >
              {AMENITY_LABELS[key]}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
        <Button
          type="button"
          onClick={handleContact}
          className="bg-violet-600 hover:bg-violet-700"
        >
          Contact customer
        </Button>
        <Link
          href={`/agency/requests/${request.id}`}
          className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          View details →
        </Link>
      </div>
    </article>
  );
}
