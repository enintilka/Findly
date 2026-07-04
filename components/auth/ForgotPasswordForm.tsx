"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { FormError } from "@/components/ui/primitives";
import { Button, Input, Label } from "@/components/ui/primitives";
import { clearAuthRateLimitCooldown } from "@/lib/auth/rate-limit-cooldown";
import { requestPasswordReset } from "@/lib/auth/password-reset";

export default function ForgotPasswordForm({
  accountLabel,
  loginHref,
  accentClassName,
}: {
  accountLabel: string;
  loginHref: string;
  accentClassName: string;
}) {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [devRecoveryUrl, setDevRecoveryUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearAuthRateLimitCooldown();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const result = await requestPasswordReset(String(form.get("email")));

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setDevRecoveryUrl(result.recoveryUrl ?? null);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          If an account exists for that email, we sent a password reset link.
          Check your inbox and spam folder.
        </div>
        {devRecoveryUrl ? (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
            <p className="font-medium">Dev reset link (for testing)</p>
            <a
              href={devRecoveryUrl}
              className="mt-2 block break-all underline"
            >
              {devRecoveryUrl}
            </a>
          </div>
        ) : null}
        <p className="text-center text-sm text-slate-600">
          <Link href={loginHref} className={`font-medium ${accentClassName}`}>
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <FormError message={error} /> : null}

      <p className="text-sm text-slate-600">
        Enter the email for your {accountLabel} account and we&apos;ll send a
        reset link.
      </p>

      <div>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <Button type="submit" disabled={loading} className={`w-full ${accentClassName}`}>
        {loading ? "Sending..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Remember your password?{" "}
        <Link href={loginHref} className={`font-medium ${accentClassName}`}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
