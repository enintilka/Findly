"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CustomerHeader from "@/components/customer/CustomerHeader";
import RequestAttachments from "@/components/customer/RequestAttachments";
import { Button } from "@/components/ui/primitives";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import { RequireCustomer } from "@/components/customer/RequireCustomer";
import {
  deleteCustomerRequest,
  getCustomerRequestById,
} from "@/lib/customer-store";
import {
  formatPropertyDetailLines,
  getPropertyTypeFormConfig,
} from "@/lib/request-property-config";
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
  const router = useRouter();
  const { customer } = useCustomerAuth();
  const [request, setRequest] = useState<CustomerRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = async () =>
      setRequest(await getCustomerRequestById(params.id));
    void refresh();
    window.addEventListener("findly-customer-change", refresh);
    window.addEventListener("findly-platform-change", refresh);
    return () => {
      window.removeEventListener("findly-customer-change", refresh);
      window.removeEventListener("findly-platform-change", refresh);
    };
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

  const canEdit =
    customer?.id === request.customerId && request.status === "open";
  const canDelete = customer?.id === request.customerId;

  async function handleDelete() {
    if (!customer || !request || !canDelete || deleting) return;

    const confirmed = confirm(
      "Delete this request permanently? Agencies will no longer see it and related chats will be removed.",
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteCustomerRequest(customer.id, request.id);
      router.push("/customer/dashboard");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this request.",
      );
      setDeleting(false);
    }
  }

  return (
    <article className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              {PROPERTY_TYPE_LABELS[request.propertyType]}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
              {request.status}
            </span>
          </div>
          {canEdit ? (
            <Link
              href={`/customer/requests/${request.id}/edit`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Edit request
            </Link>
          ) : null}
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

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
                <dt className="text-slate-500">
                  {getPropertyTypeFormConfig(request.propertyType).sizeMinLabel.replace(
                    " min",
                    "",
                  )}
                </dt>
                <dd className="font-medium text-slate-900">
                  {request.sizeMin ?? "?"} – {request.sizeMax ?? "?"} m²
                </dd>
              </div>
            ) : null}
            {getPropertyTypeFormConfig(request.propertyType).showBedrooms &&
            request.bedrooms ? (
              <div className="flex justify-between">
                <dt className="text-slate-500">
                  {getPropertyTypeFormConfig(request.propertyType).bedroomsLabel}
                </dt>
                <dd className="font-medium text-slate-900">{request.bedrooms}</dd>
              </div>
            ) : null}
            {getPropertyTypeFormConfig(request.propertyType).showBathrooms &&
            request.bathrooms ? (
              <div className="flex justify-between">
                <dt className="text-slate-500">
                  {getPropertyTypeFormConfig(request.propertyType).bathroomsLabel}
                </dt>
                <dd className="font-medium text-slate-900">{request.bathrooms}</dd>
              </div>
            ) : null}
            {formatPropertyDetailLines(request.propertyDetails).map((line) => (
              <div key={line} className="flex justify-between gap-4">
                <dt className="text-slate-500 shrink-0">{line.split(": ")[0]}</dt>
                <dd className="font-medium text-slate-900 text-right">
                  {line.includes(": ") ? line.split(": ").slice(1).join(": ") : line}
                </dd>
              </div>
            ))}
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

      <RequestAttachments request={request} />

      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/customer/dashboard"
          className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          ← Back to dashboard
        </Link>
        {canDelete ? (
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete request"}
          </Button>
        ) : null}
      </div>
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
