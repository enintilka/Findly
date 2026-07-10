import { createClient } from "@/lib/supabase";
import {
  notifyPlatformChange,
  persistImageFiles,
  storedFilesToImages,
  type StoredFile,
} from "@/lib/supabase/storage";
import type { Agency } from "@/types/agency";
import type { AgencyListing, ListingImage } from "@/types/agency";
import type { ListingRow } from "@/types/database";

const BUCKET = "listing-images";

export function rowToListing(row: ListingRow): AgencyListing {
  const storedImages = (row.images ?? []) as StoredFile[];
  return {
    id: row.id,
    agencyId: row.agency_id,
    agencyName: row.agency_name,
    title: row.title,
    description: row.description,
    city: row.city,
    country: row.country,
    price: Number(row.price),
    images: storedFilesToImages(BUCKET, storedImages),
    createdAt: row.created_at,
  };
}

export async function fetchListingsForAgency(
  agencyId: string,
): Promise<AgencyListing[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToListing(row as ListingRow));
}

export async function fetchAgencyListingById(
  listingId: string,
): Promise<AgencyListing | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToListing(data as ListingRow) : null;
}

export async function fetchCustomerListingById(
  listingId: string,
): Promise<AgencyListing | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data) return rowToListing(data as ListingRow);

  const response = await fetch(`/api/listings/${encodeURIComponent(listingId)}`, {
    credentials: "include",
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not load this property.");
  }

  return (await response.json()) as AgencyListing;
}

type ListingInput = Omit<
  AgencyListing,
  "id" | "agencyId" | "agencyName" | "createdAt"
>;

export async function createListing(
  agency: Agency,
  input: ListingInput,
): Promise<AgencyListing> {
  const supabase = createClient();
  const listingId = crypto.randomUUID();
  const images = await persistImageFiles(
    BUCKET,
    `${agency.id}/${listingId}`,
    input.images ?? [],
  );

  const { data, error } = await supabase
    .from("listings")
    .insert({
      id: listingId,
      agency_id: agency.id,
      agency_name: agency.agencyName ?? agency.contactName,
      title: input.title,
      description: input.description,
      city: input.city,
      country: input.country,
      price: input.price,
      images,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  notifyPlatformChange();
  return rowToListing(data as ListingRow);
}

export async function updateListing(
  agencyId: string,
  listingId: string,
  input: ListingInput,
  agencyName?: string,
): Promise<AgencyListing> {
  const supabase = createClient();
  const images = await persistImageFiles(
    BUCKET,
    `${agencyId}/${listingId}`,
    input.images ?? [],
  );

  const { data, error } = await supabase
    .from("listings")
    .update({
      agency_name: agencyName,
      title: input.title,
      description: input.description,
      city: input.city,
      country: input.country,
      price: input.price,
      images,
    })
    .eq("id", listingId)
    .eq("agency_id", agencyId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  notifyPlatformChange();
  return rowToListing(data as ListingRow);
}

export async function deleteListing(
  agencyId: string,
  listingId: string,
): Promise<void> {
  const supabase = createClient();
  const listing = await fetchAgencyListingById(listingId);

  if (!listing || listing.agencyId !== agencyId) {
    throw new Error("Property not found.");
  }

  const imagePaths = (listing.images ?? [])
    .map((image) => image.storagePath)
    .filter((path): path is string => Boolean(path));

  if (imagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove(imagePaths);

    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("agency_id", agencyId);

  if (error) throw new Error(error.message);
  notifyPlatformChange();
}

export function getListingImages(listing: AgencyListing): ListingImage[] {
  return listing.images ?? [];
}
