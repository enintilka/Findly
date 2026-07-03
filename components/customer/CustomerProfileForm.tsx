"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import { FieldGroup, FormSection } from "@/components/customer/FormSection";
import ProfileAvatarUpload from "@/components/ui/ProfileAvatarUpload";
import { Button, FormError, Input, Label, Textarea } from "@/components/ui/primitives";
import { validateRequiredFields } from "@/lib/validation";

interface CustomerProfileFormProps {
  mode?: "onboarding" | "edit";
}

export default function CustomerProfileForm({
  mode = "onboarding",
}: CustomerProfileFormProps) {
  const router = useRouter();
  const { customer, updateProfile } = useCustomerAuth();
  const [error, setError] = useState("");
  const [profilePicture, setProfilePicture] = useState(
    customer?.profilePicture,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer) return;
    setError("");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const country = String(form.get("country")).trim();
    const city = String(form.get("city")).trim();

    const requiredErrors = validateRequiredFields(
      { name, country, city },
      { name: "Full name", country: "Country", city: "City" },
    );

    if (requiredErrors.length > 0) {
      setError(requiredErrors[0]);
      return;
    }

    const updated = await updateProfile({
      name,
      phone: String(form.get("phone")).trim() || undefined,
      country,
      city,
      bio: String(form.get("bio")).trim() || undefined,
      profilePicture,
    });

    if (!updated) {
      setError("Could not save your profile. Please try again.");
      return;
    }

    router.push("/customer/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error ? <FormError message={error} /> : null}

      <FormSection
        title={mode === "onboarding" ? "Your profile" : "Edit profile"}
        description="Agencies see your name and photo when reviewing requests. Contact details stay private until you share them in chat."
      >
        <ProfileAvatarUpload
          value={profilePicture}
          onChange={setProfilePicture}
          fallbackInitial={customer?.name ?? "?"}
        />

        <div className="mt-6">
          <FieldGroup columns={2}>
            <div>
              <Label htmlFor="name" required>
                Full name
              </Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={customer?.name ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer?.phone ?? ""}
                placeholder="+39 123 456 7890"
              />
            </div>
            <div>
              <Label htmlFor="country" required>
                Country
              </Label>
              <Input
                id="country"
                name="country"
                required
                defaultValue={customer?.country ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="city" required>
                City
              </Label>
              <Input
                id="city"
                name="city"
                required
                defaultValue={customer?.city ?? ""}
              />
            </div>
          </FieldGroup>

          <div className="mt-5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={customer?.email ?? ""}
              readOnly
              className="bg-slate-50"
            />
          </div>

          <div className="mt-5">
            <Label htmlFor="bio">About you</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={customer?.bio ?? ""}
              placeholder="Tell agencies a little about yourself and what you're looking for."
            />
          </div>
        </div>
      </FormSection>

      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
        {mode === "onboarding" ? "Save profile and continue" : "Save changes"}
      </Button>
    </form>
  );
}
