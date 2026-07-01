import type {
  Agency,
  AgencyListing,
  ChatMessage,
  ChatThread,
  SavedRequest,
} from "@/types/agency";
import type { CustomerAppData, CustomerRequest } from "@/types/customer";

function normalizeMessage(message: ChatMessage): ChatMessage {
  const sentAt = message.sentAt ?? message.createdAt ?? new Date().toISOString();
  return {
    ...message,
    sentAt,
    status: message.status ?? "delivered",
    deliveredAt: message.deliveredAt ?? sentAt,
  };
}

function normalizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map(normalizeMessage);
}

export interface PlatformData extends CustomerAppData {
  agencies: Agency[];
  listings: AgencyListing[];
  savedRequests: SavedRequest[];
  threads: ChatThread[];
  messages: ChatMessage[];
}

export const PLATFORM_DATA_KEY = "findly-customer-data";
export const AGENCY_SESSION_KEY = "findly-agency-session";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readPlatformData(): PlatformData {
  if (typeof window === "undefined") {
    return emptyPlatformData();
  }

  const raw = localStorage.getItem(PLATFORM_DATA_KEY);
  if (!raw) {
    const empty = emptyPlatformData();
    localStorage.setItem(PLATFORM_DATA_KEY, JSON.stringify(empty));
    return empty;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PlatformData>;
    return {
      customers: parsed.customers ?? [],
      requests: parsed.requests ?? [],
      agencies: parsed.agencies ?? [],
      listings: parsed.listings ?? [],
      savedRequests: parsed.savedRequests ?? [],
      threads: parsed.threads ?? [],
      messages: normalizeMessages(parsed.messages ?? []),
    };
  } catch {
    const empty = emptyPlatformData();
    localStorage.setItem(PLATFORM_DATA_KEY, JSON.stringify(empty));
    return empty;
  }
}

function emptyPlatformData(): PlatformData {
  return {
    customers: [],
    requests: [],
    agencies: [],
    listings: [],
    savedRequests: [],
    threads: [],
    messages: [],
  };
}

export function writePlatformData(data: PlatformData) {
  localStorage.setItem(PLATFORM_DATA_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("findly-platform-change"));
  window.dispatchEvent(new Event("findly-customer-change"));
}

export function getAgencySessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AGENCY_SESSION_KEY);
}

export function setAgencySessionId(id: string | null) {
  if (id) localStorage.setItem(AGENCY_SESSION_KEY, id);
  else localStorage.removeItem(AGENCY_SESSION_KEY);
  window.dispatchEvent(new Event("findly-platform-change"));
}

export function getCurrentAgency(): Agency | null {
  const id = getAgencySessionId();
  if (!id) return null;
  return readPlatformData().agencies.find((agency) => agency.id === id) ?? null;
}

export function getAllOpenRequests(): CustomerRequest[] {
  return readPlatformData()
    .requests.filter((request) => request.status === "open")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getCustomerRequestById(
  requestId: string,
): CustomerRequest | null {
  return (
    readPlatformData().requests.find((request) => request.id === requestId) ??
    null
  );
}

export function signupAgency(input: {
  contactName: string;
  email: string;
  password: string;
}): { ok: true; agency: Agency } | { ok: false; error: string } {
  const data = readPlatformData();
  const emailTaken =
    data.agencies.some(
      (agency) => agency.email.toLowerCase() === input.email.toLowerCase(),
    ) ||
    data.customers.some(
      (customer) => customer.email.toLowerCase() === input.email.toLowerCase(),
    );

  if (emailTaken) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const agency: Agency = {
    id: createId("agency"),
    contactName: input.contactName,
    email: input.email,
    password: input.password,
    profileComplete: false,
    createdAt: new Date().toISOString(),
  };

  data.agencies.push(agency);
  writePlatformData(data);
  setAgencySessionId(agency.id);
  return { ok: true, agency };
}

export function loginAgency(
  email: string,
  password: string,
): { ok: true; agency: Agency } | { ok: false; error: string } {
  const agency = readPlatformData().agencies.find(
    (entry) =>
      entry.email.toLowerCase() === email.toLowerCase() &&
      entry.password === password,
  );

  if (!agency) {
    return { ok: false, error: "Invalid email or password." };
  }

  setAgencySessionId(agency.id);
  return { ok: true, agency };
}

export function updateAgencyProfile(
  agencyId: string,
  updates: Partial<Agency>,
): Agency | null {
  const data = readPlatformData();
  const index = data.agencies.findIndex((agency) => agency.id === agencyId);
  if (index === -1) return null;

  const updated: Agency = {
    ...data.agencies[index],
    ...updates,
    id: data.agencies[index].id,
    email: data.agencies[index].email,
    password: data.agencies[index].password,
    contactName: updates.contactName ?? data.agencies[index].contactName,
    profileComplete: true,
  };

  data.agencies[index] = updated;
  writePlatformData(data);
  return updated;
}

export function logoutAgency() {
  setAgencySessionId(null);
}

export function isRequestSaved(agencyId: string, requestId: string): boolean {
  return readPlatformData().savedRequests.some(
    (entry) => entry.agencyId === agencyId && entry.requestId === requestId,
  );
}

export function toggleSavedRequest(
  agencyId: string,
  requestId: string,
): boolean {
  const data = readPlatformData();
  const existingIndex = data.savedRequests.findIndex(
    (entry) => entry.agencyId === agencyId && entry.requestId === requestId,
  );

  if (existingIndex >= 0) {
    data.savedRequests.splice(existingIndex, 1);
    writePlatformData(data);
    return false;
  }

  data.savedRequests.unshift({
    agencyId,
    requestId,
    savedAt: new Date().toISOString(),
  });
  writePlatformData(data);
  return true;
}

export function getSavedRequestsForAgency(
  agencyId: string,
): CustomerRequest[] {
  const data = readPlatformData();
  const ids = new Set(
    data.savedRequests
      .filter((entry) => entry.agencyId === agencyId)
      .map((entry) => entry.requestId),
  );

  return data.requests.filter((request) => ids.has(request.id));
}

export function getListingsForAgency(agencyId: string): AgencyListing[] {
  return readPlatformData()
    .listings.filter((listing) => listing.agencyId === agencyId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function createAgencyListing(
  agency: Agency,
  input: Omit<AgencyListing, "id" | "agencyId" | "agencyName" | "createdAt">,
): AgencyListing {
  const data = readPlatformData();
  const listing: AgencyListing = {
    ...input,
    id: createId("listing"),
    agencyId: agency.id,
    agencyName: agency.agencyName ?? agency.contactName,
    createdAt: new Date().toISOString(),
  };

  data.listings.unshift(listing);
  writePlatformData(data);
  return listing;
}

export function startChatWithCustomer(
  agency: Agency,
  request: CustomerRequest,
): ChatThread {
  const data = readPlatformData();
  const existing = data.threads.find(
    (thread) =>
      thread.requestId === request.id && thread.agencyId === agency.id,
  );

  if (existing) return existing;

  const thread: ChatThread = {
    id: createId("thread"),
    requestId: request.id,
    requestTitle: `${request.city}, ${request.region}`,
    customerId: request.customerId,
    customerName: request.customerName,
    agencyId: agency.id,
    agencyName: agency.agencyName ?? agency.contactName,
    updatedAt: new Date().toISOString(),
  };

  const now = new Date().toISOString();
  const intro: ChatMessage = {
    id: createId("msg"),
    threadId: thread.id,
    senderId: agency.id,
    senderName: agency.agencyName ?? agency.contactName,
    senderRole: "agency",
    body: `Hello ${request.customerName}, we reviewed your request for ${request.city} and may have a suitable property. Would you be open to an online or in-person meeting this week?`,
    sentAt: now,
    deliveredAt: now,
    status: "delivered",
  };

  thread.lastMessage = intro.body;
  data.threads.unshift(thread);
  data.messages.push(intro);
  writePlatformData(data);
  return thread;
}

export function getThreadsForAgency(agencyId: string): ChatThread[] {
  return readPlatformData()
    .threads.filter(
      (thread) => thread.agencyId === agencyId && !thread.deletedByAgency,
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export function getThreadsForCustomer(customerId: string): ChatThread[] {
  return readPlatformData()
    .threads.filter(
      (thread) => thread.customerId === customerId && !thread.deletedByCustomer,
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export function getMessagesForThread(threadId: string): ChatMessage[] {
  return readPlatformData()
    .messages.filter((message) => message.threadId === threadId)
    .map(normalizeMessage)
    .sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    );
}

export function sendChatMessage(
  threadId: string,
  sender: { id: string; name: string; role: "customer" | "agency" },
  body: string,
): ChatMessage | null {
  const data = readPlatformData();
  const threadIndex = data.threads.findIndex((thread) => thread.id === threadId);
  if (threadIndex === -1) return null;

  const now = new Date().toISOString();
  const message: ChatMessage = {
    id: createId("msg"),
    threadId,
    senderId: sender.id,
    senderName: sender.name,
    senderRole: sender.role,
    body,
    sentAt: now,
    deliveredAt: now,
    status: "delivered",
  };

  data.messages.push(message);
  const thread = data.threads[threadIndex];
  data.threads[threadIndex] = {
    ...thread,
    lastMessage: body,
    updatedAt: now,
    deletedByCustomer: false,
    deletedByAgency: false,
  };

  writePlatformData(data);
  return message;
}

export function markThreadAsRead(
  threadId: string,
  reader: { id: string; role: "customer" | "agency" },
) {
  const data = readPlatformData();
  const threadIndex = data.threads.findIndex((thread) => thread.id === threadId);
  if (threadIndex === -1) return;

  const now = new Date().toISOString();
  const thread = data.threads[threadIndex];

  data.threads[threadIndex] = {
    ...thread,
    customerLastReadAt:
      reader.role === "customer" ? now : thread.customerLastReadAt,
    agencyLastReadAt: reader.role === "agency" ? now : thread.agencyLastReadAt,
  };

  data.messages = data.messages.map((message) => {
    if (message.threadId !== threadId) return message;
    if (message.senderRole === reader.role) return message;

    const normalized = normalizeMessage(message);
    return {
      ...normalized,
      status: "read",
      readAt: now,
    };
  });

  writePlatformData(data);
}

export function deleteChatMessage(messageId: string) {
  const data = readPlatformData();
  data.messages = data.messages.filter((message) => message.id !== messageId);
  writePlatformData(data);
}

export function deleteChatThread(
  threadId: string,
  user: { id: string; role: "customer" | "agency" },
) {
  const data = readPlatformData();
  const threadIndex = data.threads.findIndex((thread) => thread.id === threadId);
  if (threadIndex === -1) return;

  const thread = data.threads[threadIndex];
  if (user.role === "customer") {
    data.threads[threadIndex] = { ...thread, deletedByCustomer: true };
  } else {
    data.threads[threadIndex] = { ...thread, deletedByAgency: true };
  }

  writePlatformData(data);
}

export function getUnreadCount(
  userId: string,
  role: "customer" | "agency",
): number {
  const data = readPlatformData();
  const threads =
    role === "customer"
      ? data.threads.filter(
          (thread) => thread.customerId === userId && !thread.deletedByCustomer,
        )
      : data.threads.filter(
          (thread) => thread.agencyId === userId && !thread.deletedByAgency,
        );

  return threads.reduce((count, thread) => {
    const lastRead =
      role === "customer" ? thread.customerLastReadAt : thread.agencyLastReadAt;
    const lastReadTime = lastRead ? new Date(lastRead).getTime() : 0;
    const hasUnread = data.messages.some((message) => {
      const normalized = normalizeMessage(message);
      if (normalized.threadId !== thread.id) return false;
      if (normalized.senderRole === role) return false;
      return new Date(normalized.sentAt).getTime() > lastReadTime;
    });
    return count + (hasUnread ? 1 : 0);
  }, 0);
}

export function filterRequests(
  requests: CustomerRequest[],
  filters: {
    search: string;
    country: string;
    city: string;
    propertyType: string;
    budgetMin: string;
    budgetMax: string;
  },
): CustomerRequest[] {
  const search = filters.search.toLowerCase().trim();
  const country = filters.country.toLowerCase().trim();
  const city = filters.city.toLowerCase().trim();
  const minBudget = filters.budgetMin ? Number(filters.budgetMin) : null;
  const maxBudget = filters.budgetMax ? Number(filters.budgetMax) : null;

  return requests.filter((request) => {
    if (country && !request.country.toLowerCase().includes(country)) {
      return false;
    }
    if (city && !request.city.toLowerCase().includes(city)) {
      return false;
    }
    if (filters.propertyType && request.propertyType !== filters.propertyType) {
      return false;
    }
    if (minBudget !== null && request.budgetMax < minBudget) {
      return false;
    }
    if (maxBudget !== null && request.budgetMin > maxBudget) {
      return false;
    }
    if (search) {
      const haystack = [
        request.introduction,
        request.city,
        request.region,
        request.country,
        request.customerName,
        request.additionalNotes ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}
