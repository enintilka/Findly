"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import { deleteCustomerRequest } from "@/lib/customer-store";
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

export default function CustomerRequestCard({
  request,
}: {
  request: CustomerRequest;
}) {
  const router = useRouter();
  const { customer } = useCustomerAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const activeAmenities = (
    Object.keys(request.amenities) as Array<keyof typeof request.amenities>
  ).filter((key) => request.amenities[key]);

  const canManage = customer?.id === request.customerId;

  async function handleDelete() {
    if (!customer || !canManage || deleting) return;

    const confirmed = confirm(
      "Delete this request permanently? Agencies will no longer see it and related chats will be removed.",
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteCustomerRequest(customer.id, request.id);
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this request.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {PROPERTY_TYPE_LABELS[request.propertyType]}
          </span>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            {request.city}, {request.region}
          </h3>
          <p className="text-sm text-slate-500">
            {request.country} · Posted{" "}
            {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
          {request.status}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
        {request.introduction}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full bg-slate-100 px-3 py-1">
          {formatCurrency(request.budgetMin)} – {formatCurrency(request.budgetMax)}
        </span>
        {request.bedrooms ? (
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {request.bedrooms} beds
          </span>
        ) : null}
        {request.sizeMin || request.sizeMax ? (
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {request.sizeMin ?? "?"}–{request.sizeMax ?? "?"} m²
          </span>
        ) : null}
      </div>

      {activeAmenities.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeAmenities.slice(0, 5).map((key) => (
            <span
              key={key}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600"
            >
              {AMENITY_LABELS[key]}
            </span>
          ))}
          {activeAmenities.length > 5 ? (
            <span className="text-xs text-slate-500">
              +{activeAmenities.length - 5} more
            </span>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
        <Link
          href={`/customer/requests/${request.id}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View full request →
        </Link>
        {canManage && request.status === "open" ? (
          <Link
            href={`/customer/requests/${request.id}/edit`}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Edit
          </Link>
        ) : null}
        {canManage ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
