import type {
  Agency,
  AgencyListing,
  ChatMessage,
  ChatThread,
  SavedRequest,
} from "@/types/agency";
import type { CustomerAppData, CustomerRequest } from "@/types/customer";
import {
  deleteChatMessage as deleteChatMessageRemote,
  deleteChatThread as deleteChatThreadRemote,
  getUnreadCount as getUnreadCountRemote,
  fetchMessagesForThread,
  fetchThreadsForAgency,
  fetchThreadsForCustomer,
  markThreadAsRead as markThreadAsReadRemote,
  sendChatMessage as sendChatMessageRemote,
  startChatWithCustomer as startChatWithCustomerRemote,
  type StartChatResult,
} from "@/lib/supabase/chat";
export {
  buildAgencyContactDraft,
  storeChatDraft,
} from "@/lib/chat-drafts";
import {
  createListing,
  deleteListing,
  fetchAgencyListingById,
  fetchListingsForAgency,
  updateListing,
} from "@/lib/supabase/listings";
import {
  fetchAllOpenRequests,
  fetchCustomerRequestById,
  fetchSavedRequestsForAgency,
  isRequestSaved as isRequestSavedRemote,
  toggleSavedRequest as toggleSavedRequestRemote,
} from "@/lib/supabase/requests";

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
      messages: parsed.messages ?? [],
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
  try {
    localStorage.setItem(PLATFORM_DATA_KEY, JSON.stringify(data));
  } catch {
    throw new Error(
      "Browser storage is full. Try removing old requests or using fewer photos.",
    );
  }
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

export async function getAllOpenRequests(): Promise<CustomerRequest[]> {
  return fetchAllOpenRequests();
}

export async function getCustomerRequestById(
  requestId: string,
): Promise<CustomerRequest | null> {
  return fetchCustomerRequestById(requestId);
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

export async function isRequestSaved(
  agencyId: string,
  requestId: string,
): Promise<boolean> {
  return isRequestSavedRemote(agencyId, requestId);
}

export async function toggleSavedRequest(
  agencyId: string,
  requestId: string,
): Promise<boolean> {
  return toggleSavedRequestRemote(agencyId, requestId);
}

export async function getSavedRequestsForAgency(
  agencyId: string,
): Promise<CustomerRequest[]> {
  return fetchSavedRequestsForAgency(agencyId);
}

export async function getListingsForAgency(
  agencyId: string,
): Promise<AgencyListing[]> {
  return fetchListingsForAgency(agencyId);
}

export async function getAgencyListingById(
  listingId: string,
): Promise<AgencyListing | null> {
  return fetchAgencyListingById(listingId);
}

export async function createAgencyListing(
  agency: Agency,
  input: Omit<AgencyListing, "id" | "agencyId" | "agencyName" | "createdAt">,
): Promise<AgencyListing> {
  return createListing(agency, input);
}

export async function updateAgencyListing(
  agencyId: string,
  listingId: string,
  updates: Omit<
    AgencyListing,
    "id" | "agencyId" | "agencyName" | "createdAt"
  >,
  agencyName?: string,
): Promise<AgencyListing> {
  return updateListing(agencyId, listingId, updates, agencyName);
}

export async function deleteAgencyListing(
  agencyId: string,
  listingId: string,
): Promise<void> {
  return deleteListing(agencyId, listingId);
}

export async function startChatWithCustomer(
  agency: Agency,
  request: CustomerRequest,
): Promise<StartChatResult> {
  return startChatWithCustomerRemote(agency, request);
}

export async function getThreadsForAgency(
  agencyId: string,
): Promise<ChatThread[]> {
  return fetchThreadsForAgency(agencyId);
}

export async function getThreadsForCustomer(
  customerId: string,
): Promise<ChatThread[]> {
  return fetchThreadsForCustomer(customerId);
}

export async function getMessagesForThread(
  threadId: string,
): Promise<ChatMessage[]> {
  return fetchMessagesForThread(threadId);
}

export async function sendChatMessage(
  threadId: string,
  sender: { id: string; name: string; role: "customer" | "agency" },
  payload: string | { body: string; attachments?: import("@/types/agency").ChatAttachment[] },
): Promise<ChatMessage | null> {
  return sendChatMessageRemote(threadId, sender, payload);
}

export async function markThreadAsRead(
  threadId: string,
  reader: { id: string; role: "customer" | "agency" },
): Promise<void> {
  return markThreadAsReadRemote(threadId, reader);
}

export async function deleteChatMessage(messageId: string): Promise<void> {
  return deleteChatMessageRemote(messageId);
}

export async function deleteChatThread(
  threadId: string,
  user: { id: string; role: "customer" | "agency" },
): Promise<void> {
  return deleteChatThreadRemote(threadId, user);
}

export async function getUnreadCount(
  userId: string,
  role: "customer" | "agency",
): Promise<number> {
  return getUnreadCountRemote(userId, role);
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
