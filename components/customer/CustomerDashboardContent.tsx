"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import CustomerRequestCard from "@/components/customer/CustomerRequestCard";
import ChatThreadList from "@/components/chat/ChatThreadList";
import { getCustomerRequests } from "@/lib/customer-store";
import type { CustomerRequest } from "@/types/customer";

export default function CustomerDashboardContent() {
  const { customer } = useCustomerAuth();
  const [requests, setRequests] = useState<CustomerRequest[]>([]);

  useEffect(() => {
    if (!customer) return;
    const refresh = () => setRequests(getCustomerRequests(customer.id));
    refresh();
    window.addEventListener("findly-customer-change", refresh);
    return () => window.removeEventListener("findly-customer-change", refresh);
  }, [customer]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-200 bg-white text-lg font-semibold text-indigo-600">
            {customer?.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={customer.profilePicture}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              customer?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-indigo-900">
              Welcome, {customer?.name}
            </h2>
            <Link
              href="/customer/profile/edit"
              className="text-sm text-indigo-700 hover:underline"
            >
              Edit profile
            </Link>
          </div>
        </div>
        <p className="mt-2 text-sm text-indigo-800">
          Publish what you&apos;re looking for and wait for agencies to contact
          you through Findly. You don&apos;t need to browse thousands of listings.
        </p>
        <Link
          href="/customer/requests/new"
          className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Create a new request
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Your requests</h2>
            <span className="text-sm text-slate-500">{requests.length} total</span>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-medium text-slate-900">No requests yet</p>
              <p className="mt-2 text-sm text-slate-600">
                Describe your ideal property and make it visible to registered
                agencies.
              </p>
              <Link
                href="/customer/requests/new"
                className="mt-4 inline-block text-sm font-medium text-indigo-600"
              >
                Post your first request
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <CustomerRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Messages</h2>
            <Link
              href="/customer/chat"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>
          </div>
          {customer ? (
            <ChatThreadList
              role="customer"
              userId={customer.id}
              basePath="/customer/chat"
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}
