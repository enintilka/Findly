"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import AgencyHeader from "@/components/agency/AgencyHeader";
import ChatThreadView from "@/components/chat/ChatThreadView";
import { RequireAgency } from "@/components/agency/RequireAgency";

export default function AgencyChatThreadPage() {
  const params = useParams<{ threadId: string }>();
  const { agency } = useAgencyAuth();

  return (
    <>
      <AgencyHeader title="Conversation" />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireAgency requireProfile>
          <div className="mx-auto max-w-4xl space-y-4">
            {agency ? (
              <ChatThreadView
                threadId={params.threadId}
                role="agency"
                userId={agency.id}
                userName={agency.agencyName ?? agency.contactName}
                listPath="/agency/chat"
              />
            ) : null}
            <Link
              href="/agency/chat"
              className="inline-block text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              ← All messages
            </Link>
          </div>
        </RequireAgency>
      </main>
    </>
  );
}
