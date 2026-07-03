import type { AgencyListing, ListingImage } from "@/types/agency";

const STORAGE_KEY = "findly-listing-images";

function readStore(): Record<string, ListingImage[]> {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<
      string,
      ListingImage[]
    >;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, ListingImage[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    throw new Error(
      "Photos are too large to save. Try fewer or smaller images (under 5 MB each).",
    );
  }
}

export function stripListingImageUrls(images: ListingImage[]): ListingImage[] {
  return images.map(({ name }) => ({ name, url: "" }));
}

export function saveListingImages(
  listingId: string,
  images: ListingImage[],
): void {
  if (typeof window === "undefined") return;

  const store = readStore();
  store[listingId] = images;

  try {
    writeStore(store);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(
      "Photos are too large to save. Try fewer or smaller images (under 5 MB each).",
    );
  }
}

export function getStoredListingImages(listingId: string): ListingImage[] {
  return readStore()[listingId] ?? [];
}

export function getListingImages(listing: AgencyListing): ListingImage[] {
  if (listing.images?.some((image) => image.url)) return listing.images;
  return getStoredListingImages(listing.id);
}
