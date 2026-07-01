"use client";

import Link from "next/link";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import AgencyHeader from "@/components/agency/AgencyHeader";
import ChatThreadList from "@/components/chat/ChatThreadList";
import { RequireAgency } from "@/components/agency/RequireAgency";

export default function AgencyChatPage() {
  const { agency } = useAgencyAuth();

  return (
    <>
      <AgencyHeader
        title="Messages"
        subtitle="Chat securely with customers and arrange meetings through the platform."
      />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireAgency requireProfile>
          <div className="mx-auto max-w-3xl">
            {agency ? (
              <ChatThreadList
                role="agency"
                userId={agency.id}
                basePath="/agency/chat"
              />
            ) : null}
            <Link
              href="/agency/dashboard"
              className="mt-6 inline-block text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              ← Back to dashboard
            </Link>
          </div>
        </RequireAgency>
      </main>
    </>
  );
}
