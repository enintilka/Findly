"use client";

import { useMemo, useState } from "react";
import { FieldError, Input, Label } from "@/components/ui/primitives";
import {
  getPasswordRuleChecks,
  validatePassword,
} from "@/lib/validation";

interface PasswordFieldProps {
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  showRequirements?: boolean;
}

export default function PasswordField({
  id = "password",
  name = "password",
  label = "Password",
  required = true,
  value: controlledValue,
  onChange,
  showRequirements = true,
}: PasswordFieldProps) {
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue ?? internalValue;

  function handleChange(next: string) {
    setInternalValue(next);
    onChange?.(next);
  }

  const checks = useMemo(() => getPasswordRuleChecks(value), [value]);

  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type="password"
        required={required}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        autoComplete="new-password"
      />
      {showRequirements && value ? (
        <ul className="mt-2 space-y-1">
          {checks.map((check) => (
            <li
              key={check.message}
              className={`text-xs ${check.passed ? "text-emerald-600" : "text-slate-500"}`}
            >
              {check.passed ? "✓" : "○"} {check.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function validatePasswordField(password: string): string | null {
  const result = validatePassword(password);
  if (result.valid) return null;
  return `Password requirements: ${result.errors.join(", ")}.`;
}

export function PasswordConfirmField({
  password,
  id = "confirm",
  name = "confirm",
}: {
  password: string;
  id?: string;
  name?: string;
}) {
  const [confirm, setConfirm] = useState("");
  const mismatch =
    confirm.length > 0 && password.length > 0 && confirm !== password;

  return (
    <div>
      <Label htmlFor={id} required>
        Confirm password
      </Label>
      <Input
        id={id}
        name={name}
        type="password"
        required
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        autoComplete="new-password"
      />
      <FieldError
        message={mismatch ? "Passwords do not match." : undefined}
      />
    </div>
  );
}
