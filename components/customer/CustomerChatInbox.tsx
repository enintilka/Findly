"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import { getThreadsForCustomer } from "@/lib/agency-store";
import type { ChatThread } from "@/types/agency";

export default function CustomerChatInbox() {
  const { customer } = useCustomerAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    if (!customer) return;
    const refresh = async () =>
      setThreads(await getThreadsForCustomer(customer.id));
    void refresh();
    window.addEventListener("findly-platform-change", refresh);
    return () => window.removeEventListener("findly-platform-change", refresh);
  }, [customer]);

  if (threads.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-medium text-slate-900">No messages yet</p>
        <p className="mt-2 text-sm text-slate-600">
          When agencies contact you about your requests, conversations will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => (
        <Link
          key={thread.id}
          href={`/customer/chat/${thread.id}`}
          className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">{thread.requestTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{thread.agencyName}</p>
          {thread.lastMessage ? (
            <p className="mt-3 line-clamp-2 text-sm text-slate-600">
              {thread.lastMessage}
            </p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
