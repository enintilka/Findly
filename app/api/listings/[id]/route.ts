import { NextResponse } from "next/server";
import { rowToListing } from "@/lib/supabase/listings";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleKey } from "@/lib/supabase/service-role-env";
import type { ListingRow } from "@/types/database";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to view this property." }, { status: 401 });
  }

  const { data: directRow, error: directError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (directError) {
    return NextResponse.json({ error: directError.message }, { status: 500 });
  }

  if (directRow) {
    return NextResponse.json(rowToListing(directRow as ListingRow));
  }

  if (!hasSupabaseServiceRoleKey()) {
    return NextResponse.json(
      {
        error:
          "This property could not be loaded. Run supabase/listings-customer-read.sql in Supabase, or add SUPABASE_SERVICE_ROLE_KEY to .env.local.",
      },
      { status: 403 },
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  return NextResponse.json(rowToListing(data as ListingRow));
}
