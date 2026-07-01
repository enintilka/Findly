"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button, Textarea } from "@/components/ui/primitives";
import {
  getMessagesForThread,
  getThreadsForUser,
  sendMessage,
} from "@/lib/store";
import type { ChatMessage, ChatThread } from "@/types";

export default function ChatWindow({ threadId }: { threadId: string }) {
  const { user } = useAuth();
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    function refresh() {
      if (!user) return;
      const currentThread =
        getThreadsForUser(user.id).find((entry) => entry.id === threadId) ?? null;
      setThread(currentThread);
      setMessages(getMessagesForThread(threadId));
    }

    refresh();
    window.addEventListener("findly-data-change", refresh);
    return () => window.removeEventListener("findly-data-change", refresh);
  }, [threadId, user]);

  function handleSend(event: FormEvent) {
    event.preventDefault();
    if (!user || !draft.trim()) return;

    sendMessage(threadId, user, draft.trim());
    setDraft("");
  }

  if (!thread || !user) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
        Conversation not found.
      </div>
    );
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">{thread.requestTitle}</h1>
        <p className="text-sm text-gray-500">
          {user.role === "vendor"
            ? `Chat with ${thread.agencyName}`
            : `Chat with ${thread.vendorName}`}
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {messages.map((message) => {
          const isMine = message.senderId === user.id;
          return (
            <div
              key={message.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  isMine
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="mb-1 text-xs opacity-70">{message.senderName}</p>
                <p>{message.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-gray-200 px-6 py-4"
      >
        <div className="flex gap-3">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={2}
            placeholder="Suggest a meeting time or ask a question..."
            className="flex-1"
          />
          <Button type="submit" className="self-end">
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
