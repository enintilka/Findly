"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AgencyHeader from "@/components/agency/AgencyHeader";
import RequestAttachments from "@/components/customer/RequestAttachments";
import { RequireAgency } from "@/components/agency/RequireAgency";
import { Button } from "@/components/ui/primitives";
import {
  getCustomerRequestById,
  isRequestSaved,
  startChatWithCustomer,
  toggleSavedRequest,
} from "@/lib/agency-store";
import {
  AMENITY_LABELS,
  PROPERTY_TYPE_LABELS,
  type CustomerRequest,
} from "@/types/customer";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function RequestDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { agency } = useAgencyAuth();
  const [request, setRequest] = useState<CustomerRequest | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      setRequest(await getCustomerRequestById(params.id));
      if (agency) setSaved(await isRequestSaved(agency.id, params.id));
    };
    void refresh();
    window.addEventListener("findly-platform-change", refresh);
    return () => window.removeEventListener("findly-platform-change", refresh);
  }, [params.id, agency]);

  if (!request) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
        Request not found.
      </div>
    );
  }

  const amenities = (
    Object.keys(request.amenities) as Array<keyof typeof request.amenities>
  ).filter((key) => request.amenities[key]);

  async function handleSave() {
    if (!agency || !request) return;
    setSaved(await toggleSavedRequest(agency.id, request.id));
  }

  async function handleContact() {
    if (!agency || !request) return;
    const thread = await startChatWithCustomer(agency, request);
    router.push(`/agency/chat/${thread.id}`);
  }

  return (
    <article className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
            {PROPERTY_TYPE_LABELS[request.propertyType]}
          </span>
          <span className="text-sm text-slate-500">{request.customerName}</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          {request.city}, {request.region}, {request.country}
        </h1>
        <blockquote className="mt-6 rounded-xl bg-slate-50 p-5 leading-relaxed text-slate-700">
          {request.introduction}
        </blockquote>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Requirements</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Budget</dt>
              <dd className="font-medium">
                {formatCurrency(request.budgetMin)} –{" "}
                {formatCurrency(request.budgetMax)}
              </dd>
            </div>
            {request.bedrooms ? (
              <div className="flex justify-between">
                <dt className="text-slate-500">Bedrooms</dt>
                <dd className="font-medium">{request.bedrooms}</dd>
              </div>
            ) : null}
            {request.bathrooms ? (
              <div className="flex justify-between">
                <dt className="text-slate-500">Bathrooms</dt>
                <dd className="font-medium">{request.bathrooms}</dd>
              </div>
            ) : null}
            {request.sizeMin || request.sizeMax ? (
              <div className="flex justify-between">
                <dt className="text-slate-500">Size</dt>
                <dd className="font-medium">
                  {request.sizeMin ?? "?"} – {request.sizeMax ?? "?"} m²
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Amenities</h2>
          {amenities.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">None specified.</p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {amenities.map((key) => (
                <li
                  key={key}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                >
                  {AMENITY_LABELS[key]}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {request.additionalNotes ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Additional notes</h2>
          <p className="mt-3 text-sm text-slate-600">{request.additionalNotes}</p>
        </section>
      ) : null}

      <RequestAttachments request={request} />

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={handleContact}
          className="bg-violet-600 hover:bg-violet-700"
        >
          Contact customer
        </Button>
        <Button type="button" variant="secondary" onClick={handleSave}>
          {saved ? "Unsave request" : "Save request"}
        </Button>
      </div>
    </article>
  );
}

export default function AgencyRequestDetailPage() {
  return (
    <>
      <AgencyHeader title="Customer request" />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireAgency requireProfile>
          <div className="mx-auto max-w-4xl">
            <RequestDetail />
          </div>
        </RequireAgency>
      </main>
    </>
  );
}
