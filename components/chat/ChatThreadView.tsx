"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatComposer from "@/components/chat/ChatComposer";
import ChatMessageContent from "@/components/chat/ChatMessageContent";
import { Button } from "@/components/ui/primitives";
import {
  deleteChatMessage,
  deleteChatThread,
  getMessagesForThread,
  getThreadsForAgency,
  getThreadsForCustomer,
  markThreadAsRead,
  sendChatMessage,
} from "@/lib/agency-store";
import { consumeChatDraft } from "@/lib/chat-drafts";
import type { ChatAttachment, ChatMessage, ChatThread } from "@/types/agency";

function formatTimestamp(value?: string) {
  if (!value) return null;
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(message: ChatMessage) {
  if (message.status === "read") return "Read";
  if (message.status === "delivered") return "Delivered";
  return "Sent";
}

export default function ChatThreadView({
  threadId,
  role,
  userId,
  userName,
  listPath,
}: {
  threadId: string;
  role: "customer" | "agency";
  userId: string;
  userName: string;
  listPath: string;
}) {
  const router = useRouter();
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [composerDraft, setComposerDraft] = useState<string | undefined>();

  useEffect(() => {
    const refresh = async () => {
      const threads =
        role === "customer"
          ? await getThreadsForCustomer(userId)
          : await getThreadsForAgency(userId);
      setThread(threads.find((entry) => entry.id === threadId) ?? null);
      const nextMessages = await getMessagesForThread(threadId);
      setMessages(nextMessages);

      if (role === "agency" && nextMessages.length === 0) {
        const draft = consumeChatDraft(threadId);
        if (draft) setComposerDraft(draft);
      }
    };
    void refresh();
    void markThreadAsRead(threadId, { id: userId, role });
    window.addEventListener("findly-platform-change", refresh);
    return () => window.removeEventListener("findly-platform-change", refresh);
  }, [threadId, role, userId]);

  async function handleSend(payload: {
    body: string;
    attachments: ChatAttachment[];
  }) {
    const sent = await sendChatMessage(
      threadId,
      { id: userId, name: userName, role },
      payload,
    );
    return sent !== null;
  }

  async function handleDeleteThread() {
    if (!confirm("Delete this entire conversation?")) return;
    await deleteChatThread(threadId, { id: userId, role });
    router.push(listPath);
  }

  async function handleDeleteMessage(messageId: string) {
    if (!confirm("Delete this message?")) return;
    await deleteChatMessage(messageId);
  }

  const accent =
    role === "agency"
      ? "bg-violet-600 hover:bg-violet-700"
      : "bg-indigo-600 hover:bg-indigo-700";

  if (!thread) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
        Conversation not found.
      </div>
    );
  }

  return (
    <div className="flex h-[75vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {thread.requestTitle}
          </h1>
          <p className="text-sm text-slate-500">
            {role === "customer"
              ? `With ${thread.agencyName}`
              : `With ${thread.customerName}`}
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={handleDeleteThread}>
          Delete chat
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {messages.map((message) => {
          const isMine = message.senderRole === role;
          return (
            <div
              key={message.id}
              className={`group flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  isMine
                    ? role === "agency"
                      ? "bg-violet-600 text-white"
                      : "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                <p className="mb-1 text-xs opacity-70">{message.senderName}</p>
                <ChatMessageContent
                  message={message}
                  isMine={isMine}
                  viewerRole={role}
                />
                <div
                  className={`mt-2 space-y-0.5 text-[11px] ${isMine ? "text-white/70" : "text-slate-500"}`}
                >
                  <p>Sent: {formatTimestamp(message.sentAt)}</p>
                  {message.deliveredAt ? (
                    <p>Delivered: {formatTimestamp(message.deliveredAt)}</p>
                  ) : null}
                  {message.readAt ? (
                    <p>Read: {formatTimestamp(message.readAt)}</p>
                  ) : null}
                  {isMine ? (
                    <p className="font-medium capitalize">
                      Status: {statusLabel(message)}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(message.id)}
                  aria-label="Delete message"
                  className={`absolute -right-2 -top-2 rounded-full p-1 opacity-0 transition group-hover:opacity-100 ${
                    isMine
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "bg-white text-slate-500 shadow hover:text-red-600"
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ChatComposer
        accentClassName={accent}
        placeholder="Write a message..."
        initialDraft={composerDraft}
        onSend={handleSend}
      />
    </div>
  );
}
