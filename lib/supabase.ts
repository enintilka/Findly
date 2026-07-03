import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Browser Supabase client for Client Components.
 * Uses cookie-based session storage via @supabase/ssr.
 */
export function createClient() {
  return createBrowserClient<Database, "public">(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
  );
}
