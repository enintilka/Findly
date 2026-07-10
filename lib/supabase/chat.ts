import { createClient } from "@/lib/supabase";
import {
  notifyPlatformChange,
  persistChatAttachments,
  storedAttachmentsToChat,
} from "@/lib/supabase/storage";
import type { Agency } from "@/types/agency";
import type {
  ChatAttachment,
  ChatMessage,
  ChatThread,
} from "@/types/agency";
import type { CustomerRequest } from "@/types/customer";
import type { ChatMessageRow, ChatThreadRow } from "@/types/database";

function rowToThread(row: ChatThreadRow): ChatThread {
  return {
    id: row.id,
    requestId: row.request_id,
    requestTitle: row.request_title,
    customerId: row.customer_id,
    customerName: row.customer_name,
    agencyId: row.agency_id,
    agencyName: row.agency_name,
    lastMessage: row.last_message ?? undefined,
    updatedAt: row.updated_at,
    customerLastReadAt: row.customer_last_read_at ?? undefined,
    agencyLastReadAt: row.agency_last_read_at ?? undefined,
    deletedByCustomer: row.deleted_by_customer,
    deletedByAgency: row.deleted_by_agency,
  };
}

function rowToMessage(row: ChatMessageRow): ChatMessage {
  const stored = (row.attachments ?? []) as Array<{
    id: string;
    name: string;
    kind: "image" | "file";
    mimeType?: string;
    path: string;
  }>;

  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderRole: row.sender_role,
    body: row.body,
    attachments:
      stored.length > 0 ? storedAttachmentsToChat(stored) : undefined,
    sentAt: row.sent_at,
    deliveredAt: row.delivered_at ?? undefined,
    readAt: row.read_at ?? undefined,
    status: row.status,
  };
}

function messagePreview(body: string, attachments?: ChatAttachment[]): string {
  const trimmed = body.trim();
  if (trimmed) return trimmed;
  const first = attachments?.[0];
  if (!first) return "";
  if (first.kind === "image") return "Photo";
  return `File: ${first.name}`;
}

export async function fetchThreadsForAgency(
  agencyId: string,
): Promise<ChatThread[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("agency_id", agencyId)
    .eq("deleted_by_agency", false)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToThread(row as ChatThreadRow));
}

export async function fetchThreadsForCustomer(
  customerId: string,
): Promise<ChatThread[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("customer_id", customerId)
    .eq("deleted_by_customer", false)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToThread(row as ChatThreadRow));
}

export async function fetchMessagesForThread(
  threadId: string,
): Promise<ChatMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("sent_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToMessage(row as ChatMessageRow));
}

export type StartChatResult = {
  thread: ChatThread;
  isNew: boolean;
};

export async function startChatWithCustomer(
  agency: Agency,
  request: CustomerRequest,
): Promise<StartChatResult> {
  const supabase = createClient();
  const { data: existing, error: existingError } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("request_id", request.id)
    .eq("agency_id", agency.id)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing) {
    return { thread: rowToThread(existing as ChatThreadRow), isNew: false };
  }

  const requestTitle =
    [request.city, request.region].filter(Boolean).join(", ") ||
    request.country;
  const now = new Date().toISOString();
  const threadId = crypto.randomUUID();

  const { data: thread, error: threadError } = await supabase
    .from("chat_threads")
    .insert({
      id: threadId,
      request_id: request.id,
      request_title: requestTitle,
      customer_id: request.customerId,
      customer_name: request.customerName,
      agency_id: agency.id,
      agency_name: agency.agencyName ?? agency.contactName,
      updated_at: now,
    })
    .select("*")
    .single();

  if (threadError) throw new Error(threadError.message);

  notifyPlatformChange();
  return { thread: rowToThread(thread as ChatThreadRow), isNew: true };
}

export async function sendChatMessage(
  threadId: string,
  sender: { id: string; name: string; role: "customer" | "agency" },
  payload: string | { body: string; attachments?: ChatAttachment[] },
): Promise<ChatMessage | null> {
  const body = typeof payload === "string" ? payload : payload.body.trim();
  const attachments =
    typeof payload === "string" ? [] : (payload.attachments ?? []);

  if (!body && attachments.length === 0) return null;

  const supabase = createClient();
  const now = new Date().toISOString();
  const messageId = crypto.randomUUID();
  const storedAttachments = await persistChatAttachments(
    threadId,
    messageId,
    attachments,
  );

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      id: messageId,
      thread_id: threadId,
      sender_id: sender.id,
      sender_name: sender.name,
      sender_role: sender.role,
      body,
      attachments: storedAttachments,
      sent_at: now,
      delivered_at: now,
      status: "delivered",
    })
    .select("*")
    .single();

  if (error) {
    console.error(error.message);
    return null;
  }

  const preview = messagePreview(body, storedAttachmentsToChat(storedAttachments));

  await supabase
    .from("chat_threads")
    .update({
      last_message: preview,
      updated_at: now,
      deleted_by_customer: false,
      deleted_by_agency: false,
    })
    .eq("id", threadId);

  notifyPlatformChange();
  return rowToMessage(data as ChatMessageRow);
}

export async function markThreadAsRead(
  threadId: string,
  reader: { id: string; role: "customer" | "agency" },
): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const updates =
    reader.role === "customer"
      ? { customer_last_read_at: now }
      : { agency_last_read_at: now };

  await supabase.from("chat_threads").update(updates).eq("id", threadId);

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("id, sender_role")
    .eq("thread_id", threadId)
    .neq("sender_role", reader.role);

  if (messages?.length) {
    await supabase
      .from("chat_messages")
      .update({ status: "read", read_at: now })
      .eq("thread_id", threadId)
      .neq("sender_role", reader.role);
  }

  notifyPlatformChange();
}

export async function deleteChatMessage(messageId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("id", messageId)
    .eq("sender_id", user.id);

  if (error) throw new Error(error.message);
  notifyPlatformChange();
}

export async function deleteChatThread(
  threadId: string,
  user: { id: string; role: "customer" | "agency" },
): Promise<void> {
  const supabase = createClient();
  const updates =
    user.role === "customer"
      ? { deleted_by_customer: true }
      : { deleted_by_agency: true };

  const { error } = await supabase
    .from("chat_threads")
    .update(updates)
    .eq("id", threadId);

  if (error) throw new Error(error.message);
  notifyPlatformChange();
}

export async function getUnreadCount(
  userId: string,
  role: "customer" | "agency",
): Promise<number> {
  const threads =
    role === "customer"
      ? await fetchThreadsForCustomer(userId)
      : await fetchThreadsForAgency(userId);

  let count = 0;
  for (const thread of threads) {
    const lastRead =
      role === "customer"
        ? thread.customerLastReadAt
        : thread.agencyLastReadAt;
    const lastReadTime = lastRead ? new Date(lastRead).getTime() : 0;
    const messages = await fetchMessagesForThread(thread.id);
    const hasUnread = messages.some(
      (message) =>
        message.senderRole !== role &&
        new Date(message.sentAt).getTime() > lastReadTime,
    );
    if (hasUnread) count += 1;
  }
  return count;
}
