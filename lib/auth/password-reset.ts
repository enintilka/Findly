import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { getAccountTypeFromUser } from "@/lib/auth/account-type";
import { fetchProfile, mapAuthError } from "@/lib/auth/profile";
import { validatePasswordField } from "@/components/ui/PasswordField";
import { AUTH_ROUTES } from "@/lib/auth-routes";
import { getPasswordResetRedirectUrl } from "@/lib/site-url";
import type { Database } from "@/types/database";

const RESET_PASSWORD_PATH = "/auth/reset-password";

export { getPasswordResetRedirectUrl };

function cleanResetPasswordUrl() {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, "", RESET_PASSWORD_PATH);
}

async function tryHashAndOtpTokens(
  supabase: SupabaseClient<Database, "public">,
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  const tokenHash = params.get("token_hash");
  const type = params.get("type");

  if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });
    if (error) throw new Error(mapAuthError(error.message));
    cleanResetPasswordUrl();
    return true;
  }

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  if (!hash) return false;

  const hashParams = new URLSearchParams(hash);
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw new Error(mapAuthError(error.message));
    cleanResetPasswordUrl();
    return true;
  }

  return false;
}

function waitForRecoverySession(
  supabase: SupabaseClient<Database, "public">,
  timeoutMs = 5000,
): Promise<boolean> {
  return new Promise((resolve) => {
    let finished = false;

    const finish = (value: boolean) => {
      if (finished) return;
      finished = true;
      subscription.unsubscribe();
      window.clearTimeout(timer);
      resolve(value);
    };

    const timer = window.setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      finish(Boolean(session));
    }, timeoutMs);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") &&
        session
      ) {
        finish(true);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        finish(true);
      }
    });
  });
}

export async function establishPasswordRecoverySession(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = createClient();

  try {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    const code = params.get("code");

    if (code) {
      window.location.href = `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(RESET_PASSWORD_PATH)}`;
      return { ok: true };
    }

    const handled = await tryHashAndOtpTokens(supabase);
    if (handled) {
      return { ok: true };
    }

    const hasSession = await waitForRecoverySession(supabase);
    if (hasSession) {
      cleanResetPasswordUrl();
      return { ok: true };
    }

    return {
      ok: false,
      error:
        "This reset link is invalid or has expired. Request a new reset link and open it in the same browser.",
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "This reset link is invalid or has expired.",
    };
  }
}

export async function requestPasswordReset(
  email: string,
): Promise<
  { ok: true; recoveryUrl?: string } | { ok: false; error: string }
> {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  });

  const payload = (await response.json().catch(() => null)) as {
    ok?: boolean;
    error?: string;
    recoveryUrl?: string;
  } | null;

  if (!response.ok || !payload?.ok) {
    return {
      ok: false,
      error: payload?.error ?? "Could not send reset email.",
    };
  }

  return { ok: true, recoveryUrl: payload.recoveryUrl };
}

export async function getPostResetDestination(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return AUTH_ROUTES.chooseAccount;
  }

  const accountType = getAccountTypeFromUser(user);
  const profileResult = await fetchProfile(supabase, user.id);

  if (!profileResult.ok) {
    return accountType === "agency"
      ? AUTH_ROUTES.agencyLogin
      : AUTH_ROUTES.customerLogin;
  }

  const profile = profileResult.profile;

  if (accountType === "agency") {
    return profile.agency_name && profile.bio
      ? AUTH_ROUTES.agencyDashboard
      : "/agency/profile";
  }

  return profile.country && profile.city
    ? AUTH_ROUTES.customerDashboard
    : "/customer/profile";
}

export async function updatePasswordAfterReset(
  password: string,
): Promise<{ ok: true; destination: string } | { ok: false; error: string }> {
  const passwordError = validatePasswordField(password);
  if (passwordError) {
    return { ok: false, error: passwordError };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  const destination = await getPostResetDestination();
  return { ok: true, destination };
}
