import type { AuthResponse, SupabaseClient } from "@supabase/supabase-js";
import { mapAuthError } from "@/lib/auth/profile";

type AuthUser = NonNullable<AuthResponse["data"]["user"]>;

export type ResolveUserAfterSignUpResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string; emailConfirmationRequired?: boolean };

export async function resolveUserAfterSignUp(
  supabase: SupabaseClient,
  data: AuthResponse["data"],
  email: string,
  password: string,
): Promise<ResolveUserAfterSignUpResult> {
  if (!data.user) {
    return { ok: false, error: "Could not create account. Please try again." };
  }

  if (data.session) {
    return { ok: true, user: data.user };
  }

  // No session after sign-up usually means email confirmation is required.
  // Skip auto sign-in — it doubles auth calls and triggers rate limits quickly.
  if (!data.user.email_confirmed_at) {
    return {
      ok: false,
      emailConfirmationRequired: true,
      error:
        "Account created. Please check your email to confirm your address, then sign in.",
    };
  }

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError) {
    return { ok: false, error: mapAuthError(signInError.message) };
  }

  if (!signInData.user) {
    return {
      ok: false,
      error: "Account created. Please sign in with your email and password.",
    };
  }

  return { ok: true, user: signInData.user };
}
