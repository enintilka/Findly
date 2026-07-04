import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/auth/reset-password";
  const safeNext = next.startsWith("/") ? next : "/auth/reset-password";
  const redirectTo = `${origin}${safeNext}`;

  if (!tokenHash || !type) {
    return NextResponse.redirect(redirectTo);
  }

  const cookieStore = await cookies();
  let response = NextResponse.redirect(redirectTo);

  const supabase = createServerClient<Database, "public">(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as EmailOtpType,
  });

  if (error) {
    return NextResponse.redirect(
      `${redirectTo}?error=${encodeURIComponent(mapShortError(error.message))}`,
    );
  }

  return response;
}

function mapShortError(message: string): string {
  if (message.toLowerCase().includes("pkce")) {
    return "invalid_link";
  }

  return message;
}
