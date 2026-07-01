"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Button,
  Card,
  Input,
  Label,
} from "@/components/ui/primitives";
import type { UserRole } from "@/types";

interface AuthFormProps {
  mode: "login" | "signup";
  role: UserRole;
}

const roleCopy = {
  vendor: {
    title: "Property owner",
    subtitle: "Post your property and wait for agencies to reach out.",
    dashboard: "/dashboard/vendor",
    profile: "/profile/setup?role=vendor",
    alternateLogin: "/login/agency",
    alternateSignup: "/signup/agency",
  },
  agency: {
    title: "Real estate agency",
    subtitle: "Browse owner requests, chat in-app, and book meetings.",
    dashboard: "/dashboard/agency",
    profile: "/profile/setup?role=agency",
    alternateLogin: "/login/vendor",
    alternateSignup: "/signup/vendor",
  },
};

export default function AuthForm({ mode, role }: AuthFormProps) {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [error, setError] = useState("");
  const copy = roleCopy[role];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    if (mode === "login") {
      const result = login(email, password, role);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(
        result.user.profileComplete ? copy.dashboard : copy.profile,
      );
      return;
    }

    const name = String(form.get("name"));
    const result = signup({ email, password, role, name });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(copy.profile);
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
        {copy.title}
      </p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        {mode === "login" ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-2 text-sm text-gray-600">{copy.subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {mode === "signup" ? (
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required />
          </div>
        ) : null}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={6} />
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full">
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-sm text-gray-600">
        {mode === "login" ? (
          <p>
            No account?{" "}
            <Link href={`/signup/${role}`} className="font-medium text-blue-600">
              Sign up
            </Link>
          </p>
        ) : (
          <p>
            Already registered?{" "}
            <Link href={`/login/${role}`} className="font-medium text-blue-600">
              Sign in
            </Link>
          </p>
        )}
        <p>
          {role === "vendor" ? "Are you an agency?" : "Are you a property owner?"}{" "}
          <Link
            href={mode === "login" ? copy.alternateLogin : copy.alternateSignup}
            className="font-medium text-blue-600"
          >
            Switch here
          </Link>
        </p>
      </div>

      {mode === "login" ? (
        <p className="mt-6 rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500">
          Demo owner: owner@example.com / demo123
          <br />
          Demo agency: agency@example.com / demo123
        </p>
      ) : null}
    </Card>
  );
}
