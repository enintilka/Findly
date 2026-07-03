import type { AccountType } from "@/lib/auth/account-type";
import { mapAuthError } from "@/lib/auth/profile";
import { validatePassword } from "@/lib/validation";

export type RegisterAccountInput = {
  email: string;
  password: string;
  fullName: string;
  accountType: AccountType;
};

export type RegisterAccountResult =
  | { ok: true }
  | { ok: false; error: string; rateLimited?: boolean };

export function validateRegisterAccountInput(
  input: RegisterAccountInput,
): string | null {
  const email = input.email.trim();
  const fullName = input.fullName.trim();

  if (!fullName) {
    return "Name is required.";
  }

  if (!email) {
    return "Email is required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address.";
  }

  const passwordCheck = validatePassword(input.password);
  if (!passwordCheck.valid) {
    return passwordCheck.errors[0] ?? "Password does not meet requirements.";
  }

  if (input.accountType !== "customer" && input.accountType !== "agency") {
    return "Invalid account type.";
  }

  return null;
}

export async function registerAccount(
  input: RegisterAccountInput,
): Promise<RegisterAccountResult> {
  const validationError = validateRegisterAccountInput(input);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      email: input.email.trim(),
      password: input.password,
      fullName: input.fullName.trim(),
      accountType: input.accountType,
    }),
  });

  let payload: RegisterAccountResult;
  try {
    payload = (await response.json()) as RegisterAccountResult;
  } catch {
    return {
      ok: false,
      error: "Could not create account. Please try again.",
    };
  }

  if (!payload.ok) {
    return {
      ok: false,
      error: mapAuthError(payload.error),
      rateLimited: payload.rateLimited,
    };
  }

  return { ok: true };
}
