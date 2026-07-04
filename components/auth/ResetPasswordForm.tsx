"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordField, {
  PasswordConfirmField,
  validatePasswordField,
} from "@/components/ui/PasswordField";
import { FormError } from "@/components/ui/primitives";
import { Button } from "@/components/ui/primitives";
import { AUTH_ROUTES } from "@/lib/auth-routes";
import {
  establishPasswordRecoverySession,
  updatePasswordAfterReset,
} from "@/lib/auth/password-reset";

type Step = "verifying" | "form" | "invalid";

export default function ResetPasswordForm({
  initialError,
}: {
  initialError?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("verifying");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    initialError ? decodeURIComponent(initialError) : "",
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyResetLink() {
      const result = await establishPasswordRecoverySession();
      if (cancelled) return;

      if (result.ok) {
        setStep("form");
        setError("");
        return;
      }

      setStep("invalid");
      setError(result.error);
    }

    void verifyResetLink();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const confirm = String(form.get("confirm"));

    const passwordError = validatePasswordField(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await updatePasswordAfterReset(password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(result.destination);
    router.refresh();
  }

  if (step === "verifying") {
    return (
      <p className="text-center text-sm text-slate-500">Verifying reset link...</p>
    );
  }

  if (step === "invalid") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-slate-600">
          {error || "This reset link is invalid or has expired."}
        </p>
        <p className="text-xs text-slate-500">
          Open the reset link in the same browser where you requested it, or
          request a new link below.
        </p>
        <Link
          href={AUTH_ROUTES.customerForgotPassword}
          className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <FormError message={error} /> : null}

      <PasswordField
        value={password}
        onChange={setPassword}
        label="New password"
      />
      <PasswordConfirmField password={password} />

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {loading ? "Saving..." : "Save and continue"}
      </Button>
    </form>
  );
}
