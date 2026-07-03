import { NextResponse } from "next/server";
import type { AccountType } from "@/lib/auth/account-type";
import { mapAuthError } from "@/lib/auth/profile";
import { validateRegisterAccountInput } from "@/lib/auth/register-account";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleKey } from "@/lib/supabase/service-role-env";

function isRateLimitMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("429") ||
    normalized.includes("rate limit") ||
    normalized.includes("too many requests") ||
    normalized.includes("email rate limit") ||
    normalized.includes("over_email_send_rate_limit")
  );
}

export async function POST(request: Request) {
  if (!hasSupabaseServiceRoleKey()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Server signup is not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the dev server.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const record = body as Record<string, unknown>;
  const input = {
    email: String(record.email ?? ""),
    password: String(record.password ?? ""),
    fullName: String(record.fullName ?? ""),
    accountType: record.accountType as AccountType,
  };

  const validationError = validateRegisterAccountInput(input);
  if (validationError) {
    return NextResponse.json(
      { ok: false, error: validationError },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email: input.email.trim(),
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName.trim(),
      account_type: input.accountType,
    },
  });

  if (createError) {
    const message = mapAuthError(createError.message);
    return NextResponse.json(
      {
        ok: false,
        error: message,
        rateLimited: isRateLimitMessage(createError.message),
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });

  if (signInError) {
    const message = mapAuthError(signInError.message);
    return NextResponse.json(
      {
        ok: false,
        error: message,
        rateLimited: isRateLimitMessage(signInError.message),
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
