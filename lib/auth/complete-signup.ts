import type { AccountType } from "@/lib/auth/account-type";
import {
  ensureAgencyProfile,
  ensureCustomerProfile,
  mapAuthError,
} from "@/lib/auth/profile";
import { registerAccount } from "@/lib/auth/register-account";
import { resolveUserAfterSignUp } from "@/lib/auth/signup-session";
import { createClient } from "@/lib/supabase";
import type { Profile } from "@/types/database";
import type { User } from "@supabase/supabase-js";

type Supabase = ReturnType<typeof createClient>;

export type CompleteSignupResult =
  | { ok: true; user: User; profile: Profile }
  | { ok: true; emailConfirmationRequired: true }
  | { ok: false; error: string; rateLimited?: boolean };

async function finishSignupProfile(
  supabase: Supabase,
  user: User,
  input: {
    email: string;
    fullName: string;
    accountType: AccountType;
  },
): Promise<
  { ok: true; user: User; profile: Profile } | { ok: false; error: string }
> {
  const profileResult =
    input.accountType === "agency"
      ? await ensureAgencyProfile(supabase, user, {
          email: input.email,
          fullName: input.fullName,
        })
      : await ensureCustomerProfile(supabase, user, {
          email: input.email,
          fullName: input.fullName,
        });

  if (!profileResult.ok) {
    return { ok: false, error: mapAuthError(profileResult.error) };
  }

  if (profileResult.profile.role !== input.accountType) {
    return {
      ok: false,
      error: "Invalid email, password, or account type.",
    };
  }

  return { ok: true, user, profile: profileResult.profile };
}

async function signupWithClient(
  input: {
    email: string;
    password: string;
    fullName: string;
    accountType: AccountType;
  },
): Promise<CompleteSignupResult> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        account_type: input.accountType,
      },
    },
  });

  if (error) {
    const message = mapAuthError(error.message);
    const normalized = error.message.toLowerCase();
    return {
      ok: false,
      error: message,
      rateLimited:
        normalized.includes("429") ||
        normalized.includes("rate limit") ||
        normalized.includes("too many requests"),
    };
  }

  const sessionResult = await resolveUserAfterSignUp(
    supabase,
    data,
    input.email,
    input.password,
  );

  if (!sessionResult.ok) {
    if (sessionResult.emailConfirmationRequired) {
      return { ok: true, emailConfirmationRequired: true };
    }

    return { ok: false, error: sessionResult.error };
  }

  const finished = await finishSignupProfile(supabase, sessionResult.user, input);
  if (!finished.ok) {
    return finished;
  }

  return { ok: true, user: finished.user, profile: finished.profile };
}

export async function completeAccountSignup(input: {
  email: string;
  password: string;
  fullName: string;
  accountType: AccountType;
}): Promise<CompleteSignupResult> {
  const registerResult = await registerAccount(input);

  if (registerResult.ok) {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        ok: false,
        error: "Account created but sign-in failed. Please sign in manually.",
      };
    }

    const finished = await finishSignupProfile(supabase, user, input);
    if (!finished.ok) {
      return finished;
    }

    return { ok: true, user: finished.user, profile: finished.profile };
  }

  const serverUnavailable =
    registerResult.error.includes("SUPABASE_SERVICE_ROLE_KEY") ||
    registerResult.error.includes("Server signup is not configured");

  if (serverUnavailable) {
    return signupWithClient(input);
  }

  return registerResult;
}
