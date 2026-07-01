"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card } from "@/components/ui/primitives";
import { getThreadsForUser } from "@/lib/store";
import type { ChatThread } from "@/types";

export default function ChatInbox() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    function refresh() {
      if (!user) return;
      setThreads(getThreadsForUser(user.id));
    }

    refresh();
    window.addEventListener("findly-data-change", refresh);
    return () => window.removeEventListener("findly-data-change", refresh);
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-4">
      {threads.length === 0 ? (
        <Card>
          <p className="font-medium text-gray-900">No conversations yet</p>
          <p className="mt-2 text-sm text-gray-600">
            {user.role === "agency"
              ? "Browse owner requests and contact someone to start chatting."
              : "When agencies contact you about your request, conversations will appear here."}
          </p>
          {user.role === "agency" ? (
            <Link
              href="/browse"
              className="mt-4 inline-block text-sm font-medium text-blue-600"
            >
              Browse requests
            </Link>
          ) : (
            <Link
              href="/requests/new"
              className="mt-4 inline-block text-sm font-medium text-blue-600"
            >
              Post a request
            </Link>
          )}
        </Card>
      ) : (
        threads.map((thread) => (
          <Link key={thread.id} href={`/chat/${thread.id}`}>
            <Card className="transition hover:border-blue-200 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {thread.requestTitle}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {user.role === "vendor"
                      ? thread.agencyName
                      : thread.vendorName}
                  </p>
                  {thread.lastMessage ? (
                    <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                      {thread.lastMessage}
                    </p>
                  ) : null}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(thread.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
