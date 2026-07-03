import type { RequestImage } from "@/types/customer";
import { getRequestImages as getLegacyRequestImages } from "@/types/customer";
import type { CustomerRequest } from "@/types/customer";

const STORAGE_KEY = "findly-request-images";

function readStore(): Record<string, RequestImage[]> {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Record<
      string,
      RequestImage[]
    >;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, RequestImage[]>) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveRequestImages(
  requestId: string,
  images: RequestImage[],
): void {
  if (typeof window === "undefined") return;

  const store = readStore();
  store[requestId] = images;

  try {
    writeStore(store);
  } catch {
    throw new Error(
      "Photos are too large to save. Try fewer or smaller images (under 5 MB each).",
    );
  }
}

export function getStoredRequestImages(requestId: string): RequestImage[] {
  return readStore()[requestId] ?? [];
}

export function stripImageUrls(images: RequestImage[]): RequestImage[] {
  return images.map(({ name }) => ({ name, url: "" }));
}

export function getRequestImages(request: CustomerRequest): RequestImage[] {
  if (request.images?.some((image) => image.url)) return request.images;
  const stored = getStoredRequestImages(request.id);
  if (stored.length > 0) return stored;
  return getLegacyRequestImages(request);
}
