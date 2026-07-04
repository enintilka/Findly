import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapAuthError } from "@/lib/auth/profile";
import { getPasswordResetRedirectUrl } from "@/lib/site-url";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { hasSupabaseServiceRoleKey } from "@/lib/supabase/service-role-env";
import type { Database } from "@/types/database";

function createMailClient() {
  return createSupabaseJsClient<Database, "public">(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      auth: {
        flowType: "implicit",
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const email = String((body as { email?: string }).email ?? "").trim();
  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Email is required." },
      { status: 400 },
    );
  }

  const redirectTo = getPasswordResetRedirectUrl(request);
  const origin = redirectTo.replace(/\/auth\/reset-password$/, "");

  // Local dev only: generate a clickable link for testing without sending email.
  // Never combine generateLink + resetPasswordForEmail — Supabase counts both as
  // separate reset requests and rate-limits the second within 60 seconds.
  if (hasSupabaseServiceRoleKey() && process.env.NODE_ENV === "development") {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: mapAuthError(error.message) },
        { status: 400 },
      );
    }

    const recoveryUrl = `${origin}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery&next=${encodeURIComponent("/auth/reset-password")}`;

    return NextResponse.json({ ok: true, recoveryUrl });
  }

  const mailClient = createMailClient();
  const { error } = await mailClient.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: mapAuthError(error.message) },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
