"use client";

import Link from "next/link";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import AgencyPropertyList from "@/components/agency/AgencyPropertyList";
import AgencyRequestBrowse from "@/components/agency/AgencyRequestBrowse";
import ChatThreadList from "@/components/chat/ChatThreadList";

export default function AgencyDashboardContent() {
  const { agency } = useAgencyAuth();

  return (
    <div className="space-y-10">
      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-violet-200 bg-white text-lg font-semibold text-violet-600">
            {agency?.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={agency.profilePicture}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              (agency?.agencyName ?? agency?.contactName)?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-violet-900">
              Welcome, {agency?.agencyName ?? agency?.contactName}
            </h2>
            <Link
              href="/agency/profile/edit"
              className="text-sm text-violet-700 hover:underline"
            >
              Edit profile
            </Link>
          </div>
        </div>
        <p className="mt-2 text-sm text-violet-800">
          Browse what customers are looking for — not thousands of your own
          listings. Filter requests, save the best fits, and contact customers
          through secure in-app chat.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/agency/listings/new"
            className="inline-flex rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-violet-700 ring-1 ring-violet-200 transition hover:bg-violet-100"
          >
            Add agency property
          </Link>
          <Link
            href="/agency/chat"
            className="inline-flex rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
          >
            View messages
          </Link>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          Customer requests
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Search and filter what individuals are looking for.
        </p>
        <div className="mt-6">
          <AgencyRequestBrowse />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <AgencyPropertyList />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Recent messages
            </h2>
            <Link
              href="/agency/chat"
              className="text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              View all
            </Link>
          </div>
          <div className="mt-4">
            {agency ? (
              <ChatThreadList
                role="agency"
                userId={agency.id}
                basePath="/agency/chat"
              />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
