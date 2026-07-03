export const ACCOUNT_TYPE_METADATA_KEY = "account_type";

export type AccountType = "customer" | "agency";

export function getAccountTypeFromUser(user: {
  user_metadata?: Record<string, unknown>;
}): AccountType | null {
  const fromAccountType = user.user_metadata?.[ACCOUNT_TYPE_METADATA_KEY];
  if (fromAccountType === "customer" || fromAccountType === "agency") {
    return fromAccountType;
  }

  // Legacy signups used "role" — may not persist in Supabase metadata.
  const legacyRole = user.user_metadata?.role;
  if (legacyRole === "customer" || legacyRole === "agency") {
    return legacyRole;
  }

  return null;
}

export function normalizeAccountType(value: unknown): AccountType | null {
  return value === "customer" || value === "agency" ? value : null;
}
