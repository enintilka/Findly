import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseUrl } from "@/lib/supabase/env";
import { getSupabaseServiceRoleKey } from "@/lib/supabase/service-role-env";

export function createAdminClient() {
  return createClient<Database, "public">(
    getSupabaseUrl(),
    getSupabaseServiceRoleKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
