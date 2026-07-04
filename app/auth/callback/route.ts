import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/reset-password";
  const safeNext = next.startsWith("/") ? next : "/auth/reset-password";
  const redirectTo = `${origin}${safeNext}`;

  if (!code) {
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

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const message = encodeURIComponent(error.message);
    return NextResponse.redirect(
      `${origin}/auth/reset-password?error=${message}`,
    );
  }

  return response;
}
