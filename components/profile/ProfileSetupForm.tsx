"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Button,
  Input,
  Label,
  Textarea,
} from "@/components/ui/primitives";

interface ProfileSetupFormProps {
  role: "vendor" | "agency";
}

export default function ProfileSetupForm({ role }: ProfileSetupFormProps) {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const form = new FormData(event.currentTarget);
    const updated = updateProfile({
      name: String(form.get("name")),
      phone: String(form.get("phone")),
      city: String(form.get("city")),
      bio: String(form.get("bio")),
      companyName:
        role === "agency" ? String(form.get("companyName")) : undefined,
      licenseNumber:
        role === "agency" ? String(form.get("licenseNumber")) : undefined,
    });

    if (!updated) {
      setError("Could not save profile. Please try again.");
      return;
    }

    router.push(
      role === "vendor" ? "/dashboard/vendor" : "/dashboard/agency",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required defaultValue={user?.name ?? ""} />
      </div>

      {role === "agency" ? (
        <>
          <div>
            <Label htmlFor="companyName">Agency name</Label>
            <Input
              id="companyName"
              name="companyName"
              required
              defaultValue={user?.companyName ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="licenseNumber">License number</Label>
            <Input
              id="licenseNumber"
              name="licenseNumber"
              defaultValue={user?.licenseNumber ?? ""}
            />
          </div>
        </>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={user?.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" required defaultValue={user?.city ?? ""} />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">About you</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={user?.bio ?? ""}
          placeholder={
            role === "agency"
              ? "Describe your agency, specialties, and service area."
              : "Tell agencies about your property and selling goals."
          }
        />
      </div>

      <Button type="submit">Save profile</Button>
    </form>
  );
}
