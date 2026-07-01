"use client";

import { initialData } from "@/lib/mock-data";
import type {
  AgencyListing,
  AppData,
  ChatMessage,
  ChatThread,
  PropertyRequest,
  User,
  UserRole,
} from "@/types";

const STORAGE_KEY = "findly-app-data";
const SESSION_KEY = "findly-session";

function readData(): AppData {
  if (typeof window === "undefined") {
    return initialData;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }

  try {
    return JSON.parse(raw) as AppData;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
}

function writeData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("findly-data-change"));
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionUserId(userId: string | null) {
  if (userId) {
    localStorage.setItem(SESSION_KEY, userId);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
  window.dispatchEvent(new Event("findly-session-change"));
}

export function getCurrentUser(): User | null {
  const userId = getSessionUserId();
  if (!userId) return null;
  return readData().users.find((user) => user.id === userId) ?? null;
}

export function getAllData(): AppData {
  return readData();
}

export function getOpenRequests(city?: string): PropertyRequest[] {
  return readData()
    .requests.filter((request) => request.status === "open")
    .filter((request) =>
      city ? request.city.toLowerCase().includes(city.toLowerCase()) : true,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getRequestsByVendor(vendorId: string): PropertyRequest[] {
  return readData()
    .requests.filter((request) => request.vendorId === vendorId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getListingsByAgency(agencyId: string): AgencyListing[] {
  return readData()
    .agencyListings.filter((listing) => listing.agencyId === agencyId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getThreadsForUser(userId: string): ChatThread[] {
  return readData()
    .threads.filter(
      (thread) => thread.vendorId === userId || thread.agencyId === userId,
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export function getMessagesForThread(threadId: string): ChatMessage[] {
  return readData()
    .messages.filter((message) => message.threadId === threadId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

export function login(
  email: string,
  password: string,
  role: UserRole,
): { ok: true; user: User } | { ok: false; error: string } {
  const user = readData().users.find(
    (entry) =>
      entry.email.toLowerCase() === email.toLowerCase() &&
      entry.password === password &&
      entry.role === role,
  );

  if (!user) {
    return { ok: false, error: "Invalid email, password, or account type." };
  }

  setSessionUserId(user.id);
  return { ok: true, user };
}

export function signup(input: {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}): { ok: true; user: User } | { ok: false; error: string } {
  const data = readData();
  const exists = data.users.some(
    (user) => user.email.toLowerCase() === input.email.toLowerCase(),
  );

  if (exists) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const user: User = {
    id: createId(input.role),
    email: input.email,
    password: input.password,
    role: input.role,
    name: input.name,
    profileComplete: false,
    createdAt: new Date().toISOString(),
  };

  data.users.push(user);
  writeData(data);
  setSessionUserId(user.id);
  return { ok: true, user };
}

export function updateProfile(
  userId: string,
  updates: Partial<User>,
): User | null {
  const data = readData();
  const index = data.users.findIndex((user) => user.id === userId);
  if (index === -1) return null;

  const updated: User = {
    ...data.users[index],
    ...updates,
    id: data.users[index].id,
    email: data.users[index].email,
    password: data.users[index].password,
    role: data.users[index].role,
    profileComplete: true,
  };

  data.users[index] = updated;
  writeData(data);
  return updated;
}

export function createRequest(
  vendor: User,
  input: Omit<
    PropertyRequest,
    "id" | "vendorId" | "vendorName" | "status" | "createdAt"
  >,
): PropertyRequest {
  const data = readData();
  const request: PropertyRequest = {
    ...input,
    id: createId("req"),
    vendorId: vendor.id,
    vendorName: vendor.name,
    status: "open",
    createdAt: new Date().toISOString(),
  };

  data.requests.unshift(request);
  writeData(data);
  return request;
}

export function createAgencyListing(
  agency: User,
  input: Omit<
    AgencyListing,
    "id" | "agencyId" | "agencyName" | "createdAt"
  >,
): AgencyListing {
  const data = readData();
  const listing: AgencyListing = {
    ...input,
    id: createId("listing"),
    agencyId: agency.id,
    agencyName: agency.companyName ?? agency.name,
    createdAt: new Date().toISOString(),
  };

  data.agencyListings.unshift(listing);
  writeData(data);
  return listing;
}

export function startChat(
  request: PropertyRequest,
  agency: User,
): ChatThread {
  const data = readData();
  const existing = data.threads.find(
    (thread) =>
      thread.requestId === request.id && thread.agencyId === agency.id,
  );

  if (existing) return existing;

  const thread: ChatThread = {
    id: createId("thread"),
    requestId: request.id,
    requestTitle: request.title,
    vendorId: request.vendorId,
    vendorName: request.vendorName,
    agencyId: agency.id,
    agencyName: agency.companyName ?? agency.name,
    updatedAt: new Date().toISOString(),
  };

  const intro: ChatMessage = {
    id: createId("msg"),
    threadId: thread.id,
    senderId: agency.id,
    senderName: agency.companyName ?? agency.name,
    body: `Hi ${request.vendorName}, we saw your request "${request.title}" and would love to help. When would be a good time for an in-person meeting?`,
    createdAt: new Date().toISOString(),
  };

  thread.lastMessage = intro.body;
  data.threads.unshift(thread);
  data.messages.push(intro);
  writeData(data);
  return thread;
}

export function sendMessage(
  threadId: string,
  sender: User,
  body: string,
): ChatMessage | null {
  const data = readData();
  const threadIndex = data.threads.findIndex((thread) => thread.id === threadId);
  if (threadIndex === -1) return null;

  const message: ChatMessage = {
    id: createId("msg"),
    threadId,
    senderId: sender.id,
    senderName:
      sender.role === "agency"
        ? (sender.companyName ?? sender.name)
        : sender.name,
    body,
    createdAt: new Date().toISOString(),
  };

  data.messages.push(message);
  data.threads[threadIndex] = {
    ...data.threads[threadIndex],
    lastMessage: body,
    updatedAt: message.createdAt,
  };

  writeData(data);
  return message;
}
