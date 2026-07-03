const missingServiceRoleMessage =
  "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local. Add it from Supabase → Project Settings → API → service_role key.";

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error(missingServiceRoleMessage);
  return key;
}

export function hasSupabaseServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
