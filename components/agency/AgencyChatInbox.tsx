"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getThreadsForAgency } from "@/lib/agency-store";
import type { ChatThread } from "@/types/agency";

export default function AgencyChatInbox() {
  const [threads, setThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    const refresh = async () => {
      const agencyId = localStorage.getItem("findly-agency-session");
      if (!agencyId) return;
      setThreads(await getThreadsForAgency(agencyId));
    };
    void refresh();
    window.addEventListener("findly-platform-change", refresh);
    return () => window.removeEventListener("findly-platform-change", refresh);
  }, []);

  if (threads.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-medium text-slate-900">No conversations yet</p>
        <p className="mt-2 text-sm text-slate-600">
          Contact a customer from their request to start chatting securely
          inside Findly.
        </p>
        <Link
          href="/agency/dashboard"
          className="mt-4 inline-block text-sm font-medium text-violet-600"
        >
          Browse requests
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => (
        <Link
          key={thread.id}
          href={`/agency/chat/${thread.id}`}
          className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-200 hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                {thread.requestTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Customer: {thread.customerName}
              </p>
              {thread.lastMessage ? (
                <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                  {thread.lastMessage}
                </p>
              ) : null}
            </div>
            <span className="text-xs text-slate-400">
              {new Date(thread.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
