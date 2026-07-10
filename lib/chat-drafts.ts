import type { CustomerRequest } from "@/types/customer";

const DRAFT_STORAGE_PREFIX = "findly-chat-draft:";

export function buildAgencyContactDraft(request: CustomerRequest): string {
  const requestTitle =
    [request.city, request.region].filter(Boolean).join(", ") ||
    request.country;

  return `Hello ${request.customerName}, we reviewed your request for ${requestTitle} and may have a suitable property. Would you be open to an online or in-person meeting this week?`;
}

export function storeChatDraft(threadId: string, draft: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${DRAFT_STORAGE_PREFIX}${threadId}`, draft);
}

export function consumeChatDraft(threadId: string): string | null {
  if (typeof window === "undefined") return null;
  const key = `${DRAFT_STORAGE_PREFIX}${threadId}`;
  const draft = sessionStorage.getItem(key);
  if (draft !== null) {
    sessionStorage.removeItem(key);
  }
  return draft;
}
