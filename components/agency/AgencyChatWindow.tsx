"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import { Button, Textarea } from "@/components/ui/primitives";
import {
  getMessagesForThread,
  getThreadsForAgency,
  sendChatMessage,
} from "@/lib/agency-store";
import type { ChatMessage, ChatThread } from "@/types/agency";

export default function AgencyChatWindow({ threadId }: { threadId: string }) {
  const { agency } = useAgencyAuth();
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!agency) return;
    const refresh = () => {
      setThread(
        getThreadsForAgency(agency.id).find((entry) => entry.id === threadId) ??
          null,
      );
      setMessages(getMessagesForThread(threadId));
    };
    refresh();
    window.addEventListener("findly-platform-change", refresh);
    return () => window.removeEventListener("findly-platform-change", refresh);
  }, [agency, threadId]);

  function handleSend(event: FormEvent) {
    event.preventDefault();
    if (!agency || !draft.trim()) return;

    sendChatMessage(
      threadId,
      {
        id: agency.id,
        name: agency.agencyName ?? agency.contactName,
        role: "agency",
      },
      draft.trim(),
    );
    setDraft("");
  }

  if (!thread || !agency) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        Conversation not found.
      </div>
    );
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-900">
          {thread.requestTitle}
        </h1>
        <p className="text-sm text-slate-500">
          Chat with {thread.customerName} · No personal contact details shared
          yet
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {messages.map((message) => {
          const isMine = message.senderRole === "agency";
          return (
            <div
              key={message.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  isMine
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                <p className="mb-1 text-xs opacity-70">{message.senderName}</p>
                <p>{message.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="border-t border-slate-200 px-6 py-4">
        <div className="flex gap-3">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={2}
            placeholder="Share a property suggestion or propose a meeting time..."
            className="flex-1"
          />
          <Button type="submit" className="self-end bg-violet-600 hover:bg-violet-700">
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
