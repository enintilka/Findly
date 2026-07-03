import type { ChatAttachment } from "@/types/agency";

const STORAGE_KEY = "findly-chat-attachments";

type AttachmentStore = Record<string, ChatAttachment[]>;

function readStore(): AttachmentStore {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as AttachmentStore;
  } catch {
    return {};
  }
}

function writeStore(store: AttachmentStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    throw new Error(
      "Attachment is too large to save. Try a smaller file (under 5 MB).",
    );
  }
}

export function stripAttachmentUrls(
  attachments: ChatAttachment[],
): ChatAttachment[] {
  return attachments.map(({ id, name, kind, mimeType }) => ({
    id,
    name,
    kind,
    mimeType,
  }));
}

export function saveChatAttachments(
  messageId: string,
  attachments: ChatAttachment[],
): void {
  if (typeof window === "undefined" || attachments.length === 0) return;

  const store = readStore();
  store[messageId] = attachments;

  try {
    writeStore(store);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(
      "Attachment is too large to save. Try a smaller file (under 5 MB).",
    );
  }
}

export function getStoredChatAttachments(messageId: string): ChatAttachment[] {
  return readStore()[messageId] ?? [];
}

export function deleteChatAttachments(messageId: string): void {
  if (typeof window === "undefined") return;

  const store = readStore();
  delete store[messageId];
  writeStore(store);
}

export function resolveChatAttachments(
  messageId: string,
  attachments: ChatAttachment[] = [],
): ChatAttachment[] {
  if (attachments.length === 0) return [];

  if (attachments.some((attachment) => attachment.url)) {
    return attachments;
  }

  const stored = getStoredChatAttachments(messageId);
  const urlById = new Map(stored.map((entry) => [entry.id, entry.url]));

  return attachments.map((attachment) => ({
    ...attachment,
    url: urlById.get(attachment.id) ?? attachment.url,
  }));
}
