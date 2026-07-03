"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import { FormError } from "@/components/ui/primitives";
import { Button, Input, Label } from "@/components/ui/primitives";
import { AUTH_ROUTES } from "@/lib/auth-routes";

export default function AgencyLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAgencyAuth();
  const [error, setError] = useState("");
  const checkEmail = searchParams.get("checkEmail") === "1";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const result = await login(String(form.get("email")), String(form.get("password")));

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(
      result.agency.profileComplete
        ? AUTH_ROUTES.agencyDashboard
        : "/agency/profile",
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
      {error ? <FormError message={error} /> : null}

      <div>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div>
        <Label htmlFor="password" required>
          Password
        </Label>
        <Input id="password" name="password" type="password" required />
      </div>

      <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
        Sign in
      </Button>

      <p className="text-center text-sm text-slate-600">
        Need a different account type?{" "}
        <Link href={AUTH_ROUTES.chooseAccount} className="font-medium text-violet-600">
          Choose account type
        </Link>
      </p>

      <p className="text-center text-sm text-slate-600">
        New agency?{" "}
        <Link href={AUTH_ROUTES.agencySignup} className="font-medium text-violet-600">
          Create an account
        </Link>
      </p>
    </form>
  );
}
