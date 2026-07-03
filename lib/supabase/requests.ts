import { createClient } from "@/lib/supabase";
import {
  notifyPlatformChange,
  persistImageFiles,
  storedFilesToImages,
  type StoredFile,
} from "@/lib/supabase/storage";
import type { Customer } from "@/types/customer";
import type {
  CustomerRequest,
  PropertyType,
  RequestAmenities,
  RequestImage,
} from "@/types/customer";
import type { RequestRow } from "@/types/database";

const BUCKET = "request-images";

function rowToRequest(row: RequestRow): CustomerRequest {
  const storedImages = (row.images ?? []) as StoredFile[];
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    introduction: row.introduction,
    propertyType: row.property_type as PropertyType,
    country: row.country,
    region: row.region,
    city: row.city,
    budgetMin: Number(row.budget_min),
    budgetMax: Number(row.budget_max),
    sizeMin: row.size_min ?? undefined,
    sizeMax: row.size_max ?? undefined,
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    amenities: row.amenities as RequestAmenities,
    additionalNotes: row.additional_notes ?? undefined,
    pdfNames: row.pdf_names ?? [],
    images: storedFilesToImages(BUCKET, storedImages),
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function fetchCustomerRequests(
  customerId: string,
): Promise<CustomerRequest[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToRequest(row as RequestRow));
}

export async function fetchCustomerRequestById(
  requestId: string,
): Promise<CustomerRequest | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToRequest(data as RequestRow) : null;
}

export async function fetchAllOpenRequests(): Promise<CustomerRequest[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToRequest(row as RequestRow));
}

type RequestInput = Omit<
  CustomerRequest,
  "id" | "customerId" | "customerName" | "status" | "createdAt"
>;

export async function createRequest(
  customer: Customer,
  input: RequestInput,
): Promise<CustomerRequest> {
  const supabase = createClient();
  const requestId = crypto.randomUUID();
  const images = await persistImageFiles(
    BUCKET,
    `${customer.id}/${requestId}`,
    input.images ?? [],
  );

  const { data, error } = await supabase
    .from("requests")
    .insert({
      id: requestId,
      customer_id: customer.id,
      customer_name: customer.name,
      introduction: input.introduction,
      property_type: input.propertyType,
      country: input.country,
      region: input.region,
      city: input.city,
      budget_min: input.budgetMin,
      budget_max: input.budgetMax,
      size_min: input.sizeMin ?? null,
      size_max: input.sizeMax ?? null,
      bedrooms: input.bedrooms ?? null,
      bathrooms: input.bathrooms ?? null,
      amenities: input.amenities,
      additional_notes: input.additionalNotes ?? null,
      pdf_names: input.pdfNames ?? [],
      images,
      status: "open",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  notifyPlatformChange();
  return rowToRequest(data as RequestRow);
}

export async function updateRequest(
  customerId: string,
  requestId: string,
  input: RequestInput,
  customerName?: string,
): Promise<CustomerRequest> {
  const supabase = createClient();
  const images = await persistImageFiles(
    BUCKET,
    `${customerId}/${requestId}`,
    input.images ?? [],
  );

  const { data, error } = await supabase
    .from("requests")
    .update({
      customer_name: customerName,
      introduction: input.introduction,
      property_type: input.propertyType,
      country: input.country,
      region: input.region,
      city: input.city,
      budget_min: input.budgetMin,
      budget_max: input.budgetMax,
      size_min: input.sizeMin ?? null,
      size_max: input.sizeMax ?? null,
      bedrooms: input.bedrooms ?? null,
      bathrooms: input.bathrooms ?? null,
      amenities: input.amenities,
      additional_notes: input.additionalNotes ?? null,
      pdf_names: input.pdfNames ?? [],
      images,
    })
    .eq("id", requestId)
    .eq("customer_id", customerId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  notifyPlatformChange();
  return rowToRequest(data as RequestRow);
}

export async function fetchSavedRequestsForAgency(
  agencyId: string,
): Promise<CustomerRequest[]> {
  const supabase = createClient();
  const { data: saved, error: savedError } = await supabase
    .from("saved_requests")
    .select("request_id")
    .eq("agency_id", agencyId)
    .order("saved_at", { ascending: false });

  if (savedError) throw new Error(savedError.message);
  const ids = (saved ?? []).map((row) => row.request_id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .in("id", ids);

  if (error) throw new Error(error.message);
  const byId = new Map(
    (data ?? []).map((row) => [row.id, rowToRequest(row as RequestRow)]),
  );
  return ids
    .map((id) => byId.get(id))
    .filter((request): request is CustomerRequest => Boolean(request));
}

export async function isRequestSaved(
  agencyId: string,
  requestId: string,
): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_requests")
    .select("request_id")
    .eq("agency_id", agencyId)
    .eq("request_id", requestId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function toggleSavedRequest(
  agencyId: string,
  requestId: string,
): Promise<boolean> {
  const supabase = createClient();
  const saved = await isRequestSaved(agencyId, requestId);

  if (saved) {
    const { error } = await supabase
      .from("saved_requests")
      .delete()
      .eq("agency_id", agencyId)
      .eq("request_id", requestId);
    if (error) throw new Error(error.message);
    notifyPlatformChange();
    return false;
  }

  const { error } = await supabase.from("saved_requests").insert({
    agency_id: agencyId,
    request_id: requestId,
  });
  if (error) throw new Error(error.message);
  notifyPlatformChange();
  return true;
}

// Re-export for image display compatibility
export function getRequestImagesFromRequest(request: CustomerRequest): RequestImage[] {
  return request.images ?? [];
}
