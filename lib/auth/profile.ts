import { getAccountTypeFromUser } from "@/lib/auth/account-type";
import { createClient } from "@/lib/supabase";
import type { Agency } from "@/types/agency";
import type { Customer } from "@/types/customer";
import type { Profile, ProfileRole } from "@/types/database";

type Supabase = ReturnType<typeof createClient>;

type ProfileResult =
  | { ok: true; profile: Profile }
  | { ok: false; error: string };

export function profileToCustomer(profile: Profile): Customer {
  return {
    id: profile.id,
    name: profile.full_name ?? "",
    email: profile.email ?? "",
    password: "",
    phone: profile.phone ?? undefined,
    country: profile.country ?? undefined,
    city: profile.city ?? undefined,
    bio: profile.bio ?? undefined,
    profilePicture: profile.avatar_url ?? undefined,
    profileComplete: Boolean(profile.country && profile.city),
    createdAt: profile.created_at,
  };
}

export function profileToAgency(profile: Profile): Agency {
  return {
    id: profile.id,
    contactName: profile.full_name ?? "",
    email: profile.email ?? "",
    password: "",
    agencyName: profile.agency_name ?? undefined,
    description: profile.bio ?? undefined,
    website: profile.website ?? undefined,
    phone: profile.phone ?? undefined,
    officeAddress: profile.office_address ?? undefined,
    profilePicture: profile.avatar_url ?? undefined,
    logoName: profile.avatar_url ? "uploaded" : undefined,
    profileComplete: Boolean(profile.agency_name && profile.bio),
    createdAt: profile.created_at,
  };
}

export async function fetchProfile(
  supabase: Supabase,
  userId: string,
): Promise<ProfileResult> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "Profile not found." };
  }

  return { ok: true, profile: data };
}

export async function upsertProfile(
  supabase: Supabase,
  input: {
    id: string;
    email: string;
    fullName: string;
    role: ProfileRole;
  },
): Promise<ProfileResult> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: input.id,
        email: input.email,
        full_name: input.fullName,
        role: input.role,
      },
      { onConflict: "id" },
    )
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, profile: data };
}

export type ProfileRowUpdates = {
  full_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
  country?: string | null;
  city?: string | null;
  bio?: string | null;
  agency_name?: string | null;
  website?: string | null;
  office_address?: string | null;
};

function buildProfileUpdatePayload(
  updates: ProfileRowUpdates,
): ProfileRowUpdates {
  return Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined),
  ) as ProfileRowUpdates;
}

export async function updateProfileRow(
  supabase: Supabase,
  userId: string,
  updates: ProfileRowUpdates,
): Promise<{ ok: true; profile: Profile } | { ok: false; error: string }> {
  const payload = buildProfileUpdatePayload(updates);

  if (Object.keys(payload).length === 0) {
    return fetchProfile(supabase, userId);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update profile:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, profile: data };
}

export function mapAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (normalized.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email address, then sign in.";
  }
  if (normalized.includes("row-level security") || normalized.includes("permission denied")) {
    return "We couldn't finish setting up your account. Please try again in a moment.";
  }

  return message;
}

export function mapProfileUpdateError(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("column") &&
    (normalized.includes("does not exist") ||
      normalized.includes("could not find"))
  ) {
    return "Profile could not be saved. Run the profile SQL migrations in Supabase (add-profile-fields.sql and add-agency-profile-fields.sql).";
  }

  if (normalized.includes("row-level security") || normalized.includes("permission denied")) {
    return "We couldn't save your profile. Please sign in again and retry.";
  }

  return "Could not save your profile. Please try again.";
}

async function waitForProfile(
  supabase: Supabase,
  userId: string,
  attempts = 5,
): Promise<ProfileResult> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const result = await fetchProfile(supabase, userId);
    if (result.ok) return result;
    if (result.error !== "Profile not found.") return result;
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  return { ok: false, error: "Profile not found." };
}

function canClaimProfileRole(
  profileRole: ProfileRole,
  expectedRole: ProfileRole,
  user: { user_metadata?: Record<string, unknown> },
  hasSignupContext: boolean,
): boolean {
  if (profileRole === expectedRole) {
    return true;
  }

  const metadataRole = getAccountTypeFromUser(user);
  if (metadataRole === expectedRole) {
    return true;
  }

  if (hasSignupContext && metadataRole === null) {
    return true;
  }

  return false;
}

export async function ensureCustomerProfile(
  supabase: Supabase,
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  },
  fallback?: { email: string; fullName: string },
): Promise<ProfileResult> {
  const metadataRole = getAccountTypeFromUser(user);
  if (metadataRole === "agency") {
    return { ok: false, error: "Profile not found." };
  }

  const hasSignupContext = Boolean(fallback);

  const email = user.email ?? fallback?.email ?? "";
  const fullName =
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : fallback?.fullName) ?? "";

  const existing = await waitForProfile(supabase, user.id);
  if (existing.ok) {
    const profile = existing.profile;

    if (
      !canClaimProfileRole(profile.role ?? "customer", "customer", user, hasSignupContext)
    ) {
      return { ok: false, error: "Profile not found." };
    }

    const needsUpdate =
      profile.role !== "customer" ||
      !profile.full_name ||
      !profile.email;

    if (!needsUpdate) {
      return existing;
    }

    return upsertProfile(supabase, {
      id: user.id,
      email: email || profile.email || "",
      fullName: fullName || profile.full_name || "",
      role: "customer",
    });
  }

  if (existing.error !== "Profile not found.") {
    return existing;
  }

  return upsertProfile(supabase, {
    id: user.id,
    email,
    fullName,
    role: "customer",
  });
}

export async function ensureAgencyProfile(
  supabase: Supabase,
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  },
  fallback?: { email: string; fullName: string },
): Promise<ProfileResult> {
  const metadataRole = getAccountTypeFromUser(user);
  if (metadataRole === "customer") {
    return { ok: false, error: "Profile not found." };
  }

  const hasSignupContext = Boolean(fallback);

  const email = user.email ?? fallback?.email ?? "";
  const fullName =
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : fallback?.fullName) ?? "";

  const existing = await waitForProfile(supabase, user.id);
  if (existing.ok) {
    const profile = existing.profile;

    if (
      !canClaimProfileRole(profile.role ?? "customer", "agency", user, hasSignupContext)
    ) {
      return { ok: false, error: "Profile not found." };
    }

    const needsUpdate =
      profile.role !== "agency" ||
      !profile.full_name ||
      !profile.email;

    if (!needsUpdate) {
      return existing;
    }

    return upsertProfile(supabase, {
      id: user.id,
      email: email || profile.email || "",
      fullName: fullName || profile.full_name || "",
      role: "agency",
    });
  }

  if (existing.error !== "Profile not found.") {
    return existing;
  }

  return upsertProfile(supabase, {
    id: user.id,
    email,
    fullName,
    role: "agency",
  });
}
