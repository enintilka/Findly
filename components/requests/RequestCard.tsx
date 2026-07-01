"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button, LinkButton } from "@/components/ui/primitives";
import { startChat } from "@/lib/store";
import type { PropertyRequest } from "@/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function propertyTypeLabel(type: PropertyRequest["propertyType"]) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function RequestCard({ request }: { request: PropertyRequest }) {
  const { user } = useAuth();

  function handleContact() {
    if (!user || user.role !== "agency") return;
    const thread = startChat(request, user);
    window.location.href = `/chat/${thread.id}`;
  }

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {propertyTypeLabel(request.propertyType)}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(request.createdAt).toLocaleDateString()}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-gray-900">{request.title}</h3>
      <p className="mt-1 text-sm text-gray-500">{request.city}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">
        {request.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
        {request.bedrooms ? <span>{request.bedrooms} beds</span> : null}
        {request.area ? <span>{request.area} m²</span> : null}
        <span>By {request.vendorName}</span>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="text-2xl font-bold text-blue-600">
          {formatPrice(request.price)}
        </p>

        {user?.role === "agency" ? (
          <Button onClick={handleContact}>Contact owner</Button>
        ) : user?.role === "vendor" ? (
          <Link
            href={`/requests/${request.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View details
          </Link>
        ) : (
          <LinkButton href="/login/agency" variant="secondary">
            Agency login to contact
          </LinkButton>
        )}
      </div>
    </article>
  );
}
