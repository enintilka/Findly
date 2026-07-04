"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import { FormError } from "@/components/ui/primitives";
import { Button, Input, Label } from "@/components/ui/primitives";
import { AUTH_ROUTES } from "@/lib/auth-routes";

export default function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useCustomerAuth();
  const [error, setError] = useState("");
  const checkEmail = searchParams.get("checkEmail") === "1";
  const passwordReset = searchParams.get("reset") === "1";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const result = await login(
      String(form.get("email")),
      String(form.get("password")),
    );

    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (!("customer" in result)) {
      return;
    }

    router.push(
      result.customer.profileComplete
        ? AUTH_ROUTES.customerDashboard
        : "/customer/profile",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {checkEmail ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Account created. Check your email to confirm your address, then sign in
          below.
        </div>
      ) : null}
      {passwordReset ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Password updated. Sign in with your new password.
        </div>
      ) : null}
      {error ? <FormError message={error} /> : null}

      <div>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password" required>
            Password
          </Label>
          <Link
            href={AUTH_ROUTES.customerForgotPassword}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Forgot password?
          </Link>
        </div>
        <Input id="password" name="password" type="password" required />
      </div>

      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
        Sign in
      </Button>

      <p className="text-center text-sm text-slate-600">
        Need a different account type?{" "}
        <Link href={AUTH_ROUTES.chooseAccount} className="font-medium text-indigo-600">
          Choose account type
        </Link>
      </p>

      <p className="text-center text-sm text-slate-600">
        New to Findly?{" "}
        <Link href={AUTH_ROUTES.customerSignup} className="font-medium text-indigo-600">
          Create an account
        </Link>
      </p>
    </form>
  );
}
