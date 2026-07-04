"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import { FormError } from "@/components/ui/primitives";
import { Button, Input, Label } from "@/components/ui/primitives";
import PasswordField, {
  PasswordConfirmField,
  validatePasswordField,
} from "@/components/ui/PasswordField";
import { validateRequiredFields } from "@/lib/validation";
import { AUTH_ROUTES } from "@/lib/auth-routes";

export default function AgencySignupForm() {
  const router = useRouter();
  const { signup } = useAgencyAuth();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError("");

    const form = new FormData(event.currentTarget);
    const contactName = String(form.get("contactName")).trim();
    const email = String(form.get("email")).trim();
    const confirm = String(form.get("confirm"));

    const requiredErrors = validateRequiredFields(
      { contactName, email, password, confirm },
      {
        contactName: "Your name",
        email: "Work email",
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
      const result = await signup({ contactName, email, password });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      if ("emailConfirmationRequired" in result) {
        router.push("/agency/login?checkEmail=1");
        return;
      }

      router.push("/agency/profile");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error ? <FormError message={error} /> : null}

      <div>
        <Label htmlFor="contactName" required>
          Your name
        </Label>
        <Input id="contactName" name="contactName" required />
      </div>

      <div>
        <Label htmlFor="email" required>
          Work email
        </Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <PasswordField
        value={password}
        onChange={setPassword}
        showRequirements
      />

      <PasswordConfirmField password={password} />

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-violet-600 hover:bg-violet-700"
      >
        {submitting ? "Creating account…" : "Create agency account"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link href={AUTH_ROUTES.chooseAccount} className="font-medium text-violet-600">
          Sign in
        </Link>
      </p>

      <p className="text-center text-sm text-slate-600">
        Looking for a property instead?{" "}
        <Link href="/customer/signup" className="font-medium text-indigo-600">
          Register as customer
        </Link>
      </p>
    </form>
  );
}
