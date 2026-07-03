"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  deleteChatThread,
  getThreadsForAgency,
  getThreadsForCustomer,
} from "@/lib/agency-store";
import type { ChatThread } from "@/types/agency";

function formatTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatThreadList({
  role,
  userId,
  basePath,
}: {
  role: "customer" | "agency";
  userId: string;
  basePath: "/customer/chat" | "/agency/chat";
}) {
  const [threads, setThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    const refresh = async () => {
      setThreads(
        await (role === "customer"
          ? getThreadsForCustomer(userId)
          : getThreadsForAgency(userId)),
      );
    };
    void refresh();
    window.addEventListener("findly-platform-change", refresh);
    return () => window.removeEventListener("findly-platform-change", refresh);
  }, [role, userId]);

  async function handleDelete(event: React.MouseEvent, threadId: string) {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    await deleteChatThread(threadId, { id: userId, role });
  }

  if (threads.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="font-medium text-slate-900">No conversations yet</p>
        <p className="mt-2 text-sm text-slate-600">
          {role === "customer"
            ? "When agencies contact you about your requests, they'll appear here."
            : "Contact a customer from their request to start a conversation."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => (
        <div
          key={thread.id}
          className="group relative rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
        >
          <Link href={`${basePath}/${thread.id}`} className="block p-5 pr-14">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {thread.requestTitle}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {role === "customer"
                    ? thread.agencyName
                    : thread.customerName}
                </p>
                {thread.lastMessage ? (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                    {thread.lastMessage}
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {formatTime(thread.updatedAt)}
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={(event) => handleDelete(event, thread.id)}
            aria-label="Delete conversation"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
