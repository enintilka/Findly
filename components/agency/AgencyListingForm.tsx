"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import ListingPhotoUpload from "@/components/agency/ListingPhotoUpload";
import { FieldGroup, FormSection } from "@/components/customer/FormSection";
import {
  createAgencyListing,
  updateAgencyListing,
} from "@/lib/agency-store";
import type { AgencyListing, ListingImage } from "@/types/agency";
import { Button, FormError, Input, Label, Textarea } from "@/components/ui/primitives";

export default function AgencyListingForm({
  listing,
}: {
  listing?: AgencyListing;
}) {
  const router = useRouter();
  const { agency } = useAgencyAuth();
  const isEdit = Boolean(listing);
  const [error, setError] = useState("");
  const [images, setImages] = useState<ListingImage[]>(listing?.images ?? []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agency) return;
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title")).trim(),
      description: String(form.get("description")).trim(),
      city: String(form.get("city")).trim(),
      country: String(form.get("country")).trim(),
      price: Number(form.get("price")),
      images,
    };

    if (!payload.title || !payload.description || !payload.country || !payload.price) {
      setError("Title, description, country, and price are required.");
      return;
    }

    try {
      if (isEdit && listing) {
        await updateAgencyListing(
          agency.id,
          listing.id,
          payload,
          agency.agencyName ?? agency.contactName,
        );
        router.push(`/agency/listings/${listing.id}`);
      } else {
        await createAgencyListing(agency, payload);
        router.push("/agency/dashboard");
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save your property. Please try again.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      key={listing?.id ?? "new"}
    >
      {error ? <FormError message={error} /> : null}

      <FormSection
        title={isEdit ? "Edit property" : "Add a property"}
        description={
          isEdit
            ? "Update details or photos for this listing."
            : "Optional — upload listings your agency represents so you can match them to customer requests."
        }
      >
        <div className="space-y-5">
          <div>
            <Label htmlFor="title" required>
              Title
            </Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={listing?.title ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="description" required>
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={4}
              defaultValue={listing?.description ?? ""}
            />
          </div>
          <FieldGroup columns={3}>
            <div>
              <Label htmlFor="country" required>
                Country
              </Label>
              <Input
                id="country"
                name="country"
                required
                defaultValue={listing?.country ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                defaultValue={listing?.city ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="price" required>
                Price (€)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                required
                min={0}
                defaultValue={listing?.price ?? ""}
              />
            </div>
          </FieldGroup>
        </div>
      </FormSection>

      <FormSection
        title="Photos"
        description="Add photos to showcase this property."
      >
        <ListingPhotoUpload images={images} onImagesChange={setImages} />
      </FormSection>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            router.push(
              isEdit && listing
                ? `/agency/listings/${listing.id}`
                : "/agency/dashboard",
            )
          }
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
          {isEdit ? "Save changes" : "Add property"}
        </Button>
      </div>
    </form>
  );
}
