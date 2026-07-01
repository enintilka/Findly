"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CustomerHeader from "@/components/customer/CustomerHeader";
import { RequireCustomer } from "@/components/customer/RequireCustomer";
import { getCustomerRequestById } from "@/lib/customer-store";
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

function RequestDetailContent() {
  const params = useParams<{ id: string }>();
  const [request, setRequest] = useState<CustomerRequest | null>(null);

  useEffect(() => {
    const refresh = () =>
      setRequest(getCustomerRequestById(params.id));
    refresh();
    window.addEventListener("findly-customer-change", refresh);
    return () => window.removeEventListener("findly-customer-change", refresh);
  }, [params.id]);

  if (!request) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
        Request not found.
      </div>
    );
  }

  const activeAmenities = (
    Object.keys(request.amenities) as Array<keyof typeof request.amenities>
  ).filter((key) => request.amenities[key]);

  return (
    <article className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {PROPERTY_TYPE_LABELS[request.propertyType]}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
            {request.status}
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          {request.city}, {request.region}
        </h1>
        <p className="text-slate-500">
          {request.country} · Posted{" "}
          {new Date(request.createdAt).toLocaleDateString()}
        </p>

        <blockquote className="mt-6 rounded-xl bg-slate-50 p-5 text-slate-700 leading-relaxed">
          {request.introduction}
        </blockquote>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Budget & size</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Budget</dt>
              <dd className="font-medium text-slate-900">
                {formatCurrency(request.budgetMin)} –{" "}
                {formatCurrency(request.budgetMax)}
              </dd>
            </div>
            {request.sizeMin || request.sizeMax ? (
              <div className="flex justify-between">
                <dt className="text-slate-500">Size</dt>
                <dd className="font-medium text-slate-900">
                  {request.sizeMin ?? "?"} – {request.sizeMax ?? "?"} m²
                </dd>
              </div>
            ) : null}
            {request.bedrooms ? (
              <div className="flex justify-between">
                <dt className="text-slate-500">Bedrooms</dt>
                <dd className="font-medium text-slate-900">{request.bedrooms}</dd>
              </div>
            ) : null}
            {request.bathrooms ? (
              <div className="flex justify-between">
                <dt className="text-slate-500">Bathrooms</dt>
                <dd className="font-medium text-slate-900">{request.bathrooms}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Amenities</h2>
          {activeAmenities.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No specific amenities selected.</p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {activeAmenities.map((key) => (
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
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {request.additionalNotes}
          </p>
        </section>
      ) : null}

      {(request.imageNames.length > 0 || request.pdfNames.length > 0) ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Attachments</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {request.imageNames.map((name) => (
              <li key={name}>Image: {name}</li>
            ))}
            {request.pdfNames.map((name) => (
              <li key={name}>PDF: {name}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        href="/customer/dashboard"
        className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        ← Back to dashboard
      </Link>
    </article>
  );
}

export default function CustomerRequestDetailPage() {
  return (
    <>
      <CustomerHeader title="Request details" />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireCustomer requireProfile>
          <div className="mx-auto max-w-4xl">
            <RequestDetailContent />
          </div>
        </RequireCustomer>
      </main>
    </>
  );
}
