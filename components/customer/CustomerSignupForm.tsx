"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import { FormError } from "@/components/ui/primitives";
import { Button, Input, Label } from "@/components/ui/primitives";
import PasswordField, {
  PasswordConfirmField,
  validatePasswordField,
} from "@/components/ui/PasswordField";
import {
  formatAuthRateLimitWait,
  getAuthRateLimitRemainingMs,
  setAuthRateLimitCooldown,
} from "@/lib/auth/rate-limit-cooldown";
import { validateRequiredFields } from "@/lib/validation";
import { AUTH_ROUTES } from "@/lib/auth-routes";

export default function CustomerSignupForm() {
  const router = useRouter();
  const { signup } = useCustomerAuth();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0);

  useEffect(() => {
    function updateCooldown() {
      setCooldownMs(getAuthRateLimitRemainingMs());
    }

    updateCooldown();
    const timer = window.setInterval(updateCooldown, 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const remaining = getAuthRateLimitRemainingMs();
    if (remaining > 0) {
      setError(
        `Too many attempts. Please wait ${formatAuthRateLimitWait(remaining)} before trying again.`,
      );
      return;
    }

    setError("");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const email = String(form.get("email")).trim();
    const confirm = String(form.get("confirm"));

    const requiredErrors = validateRequiredFields(
      { name, email, password, confirm },
      {
        name: "Full name",
        email: "Email",
        password: "Password",
        confirm: "Confirm password",
      },
    );

    if (requiredErrors.length > 0) {
      setError(requiredErrors[0]);
      return;
    }

    const passwordError = validatePasswordField(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await signup({ name, email, password });
      if (!result.ok) {
        if (result.rateLimited) {
          setAuthRateLimitCooldown();
          setCooldownMs(getAuthRateLimitRemainingMs());
        }
        setError(result.error);
        return;
      }

      if ("emailConfirmationRequired" in result) {
        router.push("/customer/login?checkEmail=1");
        return;
      }

      router.push("/customer/profile");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error ? <FormError message={error} /> : null}

      <div>
        <Label htmlFor="name" required>
          Full name
        </Label>
        <Input id="name" name="name" required placeholder="Enea Rossi" />
      </div>

      <div>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
        />
      </div>

      <PasswordField
        value={password}
        onChange={setPassword}
        showRequirements
      />

      <PasswordConfirmField password={password} />

      <Button
        type="submit"
        disabled={submitting || cooldownMs > 0}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {submitting
          ? "Creating account…"
          : cooldownMs > 0
            ? `Wait ${formatAuthRateLimitWait(cooldownMs)}`
            : "Create account"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href={AUTH_ROUTES.chooseAccount} className="font-medium text-indigo-600">
          Sign in
        </Link>
      </p>

      <p className="text-center text-sm text-slate-600">
        Are you a real estate agency?{" "}
        <Link href="/agency/signup" className="font-medium text-violet-600">
          Register as agency
        </Link>
      </p>
    </form>
  );
}
