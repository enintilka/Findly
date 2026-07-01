import type { Customer, CustomerAppData, CustomerRequest } from "@/types/customer";
import {
  PLATFORM_DATA_KEY,
  readPlatformData,
  writePlatformData,
} from "@/lib/agency-store";

const SESSION_KEY = "findly-customer-session";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readData(): CustomerAppData {
  const platform = readPlatformData();
  return {
    customers: platform.customers,
    requests: platform.requests,
  };
}

function writeData(data: CustomerAppData) {
  const platform = readPlatformData();
  writePlatformData({
    ...platform,
    customers: data.customers,
    requests: data.requests,
  });
}

export function getCustomerSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setCustomerSessionId(id: string | null) {
  if (id) localStorage.setItem(SESSION_KEY, id);
  else localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("findly-customer-change"));
}

export function getCurrentCustomer(): Customer | null {
  const id = getCustomerSessionId();
  if (!id) return null;
  return readData().customers.find((customer) => customer.id === id) ?? null;
}

export function getCustomerRequests(customerId: string): CustomerRequest[] {
  return readData()
    .requests.filter((request) => request.customerId === customerId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getCustomerRequestById(
  requestId: string,
): CustomerRequest | null {
  return readData().requests.find((request) => request.id === requestId) ?? null;
}

export function signupCustomer(input: {
  name: string;
  email: string;
  password: string;
}): { ok: true; customer: Customer } | { ok: false; error: string } {
  const data = readData();
  const exists = data.customers.some(
    (customer) => customer.email.toLowerCase() === input.email.toLowerCase(),
  );

  if (exists) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const customer: Customer = {
    id: createId("customer"),
    name: input.name,
    email: input.email,
    password: input.password,
    profileComplete: false,
    createdAt: new Date().toISOString(),
  };

  data.customers.push(customer);
  writeData(data);
  setCustomerSessionId(customer.id);
  return { ok: true, customer };
}

export function loginCustomer(
  email: string,
  password: string,
): { ok: true; customer: Customer } | { ok: false; error: string } {
  const customer = readData().customers.find(
    (entry) =>
      entry.email.toLowerCase() === email.toLowerCase() &&
      entry.password === password,
  );

  if (!customer) {
    return { ok: false, error: "Invalid email or password." };
  }

  setCustomerSessionId(customer.id);
  return { ok: true, customer };
}

export function updateCustomerProfile(
  customerId: string,
  updates: Partial<Customer>,
): Customer | null {
  const data = readData();
  const index = data.customers.findIndex(
    (customer) => customer.id === customerId,
  );
  if (index === -1) return null;

  const updated: Customer = {
    ...data.customers[index],
    ...updates,
    id: data.customers[index].id,
    email: data.customers[index].email,
    password: data.customers[index].password,
    profileComplete: true,
  };

  data.customers[index] = updated;
  writeData(data);
  return updated;
}

export function createCustomerRequest(
  customer: Customer,
  request: Omit<
    CustomerRequest,
    "id" | "customerId" | "customerName" | "status" | "createdAt"
  >,
): CustomerRequest {
  const data = readData();
  const entry: CustomerRequest = {
    ...request,
    id: createId("request"),
    customerId: customer.id,
    customerName: customer.name,
    status: "open",
    createdAt: new Date().toISOString(),
  };

  data.requests.unshift(entry);
  writeData(data);
  return entry;
}

export function logoutCustomer() {
  setCustomerSessionId(null);
}
