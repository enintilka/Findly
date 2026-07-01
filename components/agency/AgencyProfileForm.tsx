"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import { FieldGroup, FormSection } from "@/components/customer/FormSection";
import ProfileAvatarUpload from "@/components/ui/ProfileAvatarUpload";
import { Button, FormError, Input, Label, Textarea } from "@/components/ui/primitives";
import { validateRequiredFields } from "@/lib/validation";

interface AgencyProfileFormProps {
  mode?: "onboarding" | "edit";
}

export default function AgencyProfileForm({
  mode = "onboarding",
}: AgencyProfileFormProps) {
  const router = useRouter();
  const { agency, updateProfile } = useAgencyAuth();
  const [error, setError] = useState("");
  const [profilePicture, setProfilePicture] = useState(agency?.profilePicture);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agency) return;
    setError("");

    const form = new FormData(event.currentTarget);
    const agencyName = String(form.get("agencyName")).trim();
    const description = String(form.get("description")).trim();

    const requiredErrors = validateRequiredFields(
      { agencyName, description },
      { agencyName: "Agency name", description: "Description" },
    );

    if (requiredErrors.length > 0) {
      setError(requiredErrors[0]);
      return;
    }

    const updated = updateProfile({
      agencyName,
      description,
      website: String(form.get("website")).trim() || undefined,
      phone: String(form.get("phone")).trim() || undefined,
      officeAddress: String(form.get("officeAddress")).trim() || undefined,
      profilePicture,
      logoName: profilePicture ? "uploaded" : undefined,
    });

    if (!updated) {
      setError("Could not save your profile. Please try again.");
      return;
    }

    router.push("/agency/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error ? <FormError message={error} /> : null}

      <FormSection
        title={mode === "onboarding" ? "Agency profile" : "Edit agency profile"}
        description="This is what customers see when you contact them. Contact details stay private until you share them in chat."
      >
        <ProfileAvatarUpload
          value={profilePicture}
          onChange={setProfilePicture}
          label="Agency logo / profile picture"
          fallbackInitial={agency?.agencyName ?? agency?.contactName ?? "?"}
        />

        <div className="mt-6 space-y-5">
          <FieldGroup columns={2}>
            <div>
              <Label htmlFor="agencyName" required>
                Agency name
              </Label>
              <Input
                id="agencyName"
                name="agencyName"
                required
                defaultValue={agency?.agencyName ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="contactName">Contact person</Label>
              <Input
                id="contactName"
                value={agency?.contactName ?? ""}
                readOnly
                className="bg-slate-50"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={agency?.phone ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                defaultValue={agency?.website ?? ""}
                placeholder="https://example.com"
              />
            </div>
          </FieldGroup>

          <div>
            <Label htmlFor="email">Login email</Label>
            <Input
              id="email"
              value={agency?.email ?? ""}
              readOnly
              className="bg-slate-50"
            />
          </div>

          <div>
            <Label htmlFor="officeAddress">Office address</Label>
            <Input
              id="officeAddress"
              name="officeAddress"
              defaultValue={agency?.officeAddress ?? ""}
            />
          </div>

          <div>
            <Label htmlFor="description" required>
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              required
              defaultValue={agency?.description ?? ""}
            />
          </div>
        </div>
      </FormSection>

      <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
        {mode === "onboarding" ? "Save profile and continue" : "Save changes"}
      </Button>
    </form>
  );
}
