"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import ListingPhotoUpload from "@/components/agency/ListingPhotoUpload";
import { FieldGroup, FormSection } from "@/components/customer/FormSection";
import {
  createAgencyListing,
  deleteAgencyListing,
  updateAgencyListing,
} from "@/lib/agency-store";
import type { AgencyListing, ListingImage } from "@/types/agency";
import {
  AMENITY_LABELS,
  EMPTY_AMENITIES,
  PROPERTY_TYPE_LABELS,
  type PropertyType,
  type RequestAmenities,
} from "@/types/customer";
import {
  Button,
  FormError,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/primitives";

function AmenityCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: keyof RequestAmenities;
  label: string;
  checked: boolean;
  onChange: (key: keyof RequestAmenities, value: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-violet-200 hover:bg-violet-50/50"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(id, event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
      />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

export default function AgencyListingForm({
  listing,
}: {
  listing?: AgencyListing;
}) {
  const router = useRouter();
  const { agency } = useAgencyAuth();
  const isEdit = Boolean(listing);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [images, setImages] = useState<ListingImage[]>(listing?.images ?? []);
  const [amenities, setAmenities] = useState<RequestAmenities>(
    listing?.amenities ?? EMPTY_AMENITIES,
  );

  function handleAmenityChange(key: keyof RequestAmenities, value: boolean) {
    setAmenities((current) => ({ ...current, [key]: value }));
  }

  async function handleDelete() {
    if (!agency || !listing || deleting) return;

    const confirmed = confirm(
      "Delete this property permanently? It will no longer appear in chat links or customer views.",
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteAgencyListing(agency.id, listing.id);
      router.push("/agency/dashboard");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this property.",
      );
      setDeleting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agency) return;
    setError("");

    const form = new FormData(event.currentTarget);
    const budgetMin = Number(form.get("budgetMin"));
    const budgetMax = Number(form.get("budgetMax"));

    const payload = {
      title: String(form.get("title")).trim(),
      description: String(form.get("description")).trim(),
      city: String(form.get("city")).trim(),
      country: String(form.get("country")).trim(),
      propertyType: String(form.get("propertyType")) as PropertyType,
      budgetMin,
      budgetMax,
      sizeMin: Number(form.get("sizeMin")) || undefined,
      sizeMax: Number(form.get("sizeMax")) || undefined,
      bedrooms: Number(form.get("bedrooms")) || undefined,
      bathrooms: Number(form.get("bathrooms")) || undefined,
      amenities,
      images,
      price: budgetMax,
    };

    if (!payload.title || !payload.description || !payload.country) {
      setError("Title, description, and country are required.");
      return;
    }

    if (!budgetMin || !budgetMax) {
      setError("Budget min and max are required.");
      return;
    }

    if (budgetMax < budgetMin) {
      setError("Maximum budget must be greater than or equal to minimum budget.");
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
          <FieldGroup columns={2}>
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
          </FieldGroup>
        </div>
      </FormSection>

      <FormSection title="Property details">
        <FieldGroup columns={2}>
          <div>
            <Label htmlFor="propertyType" required>
              Property type
            </Label>
            <Select
              id="propertyType"
              name="propertyType"
              required
              defaultValue={listing?.propertyType ?? "vacation_home"}
            >
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div />
          <div>
            <Label htmlFor="budgetMin" required>
              Budget min (€)
            </Label>
            <Input
              id="budgetMin"
              name="budgetMin"
              type="number"
              required
              min={0}
              defaultValue={listing?.budgetMin ?? listing?.price ?? ""}
              placeholder="100000"
            />
          </div>
          <div>
            <Label htmlFor="budgetMax" required>
              Budget max (€)
            </Label>
            <Input
              id="budgetMax"
              name="budgetMax"
              type="number"
              required
              min={0}
              defaultValue={listing?.budgetMax ?? listing?.price ?? ""}
              placeholder="130000"
            />
          </div>
          <div>
            <Label htmlFor="sizeMin">Size min (m²)</Label>
            <Input
              id="sizeMin"
              name="sizeMin"
              type="number"
              min={0}
              defaultValue={listing?.sizeMin ?? ""}
              placeholder="50"
            />
          </div>
          <div>
            <Label htmlFor="sizeMax">Size max (m²)</Label>
            <Input
              id="sizeMax"
              name="sizeMax"
              type="number"
              min={0}
              defaultValue={listing?.sizeMax ?? ""}
              placeholder="60"
            />
          </div>
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              defaultValue={listing?.bedrooms ?? ""}
              placeholder="2"
            />
          </div>
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              defaultValue={listing?.bathrooms ?? ""}
              placeholder="1"
            />
          </div>
        </FieldGroup>
      </FormSection>

      <FormSection
        title="Amenities & preferences"
        description="Select anything that applies. Leave unchecked if it doesn't matter."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(AMENITY_LABELS) as Array<keyof RequestAmenities>).map(
            (key) => (
              <AmenityCheckbox
                key={key}
                id={key}
                label={AMENITY_LABELS[key]}
                checked={amenities[key]}
                onChange={handleAmenityChange}
              />
            ),
          )}
        </div>
      </FormSection>

      <FormSection
        title="Photos"
        description="Add photos to showcase this property."
      >
        <ListingPhotoUpload images={images} onImagesChange={setImages} />
      </FormSection>

      {isEdit && listing ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-sm font-semibold text-red-900">Delete this property</h2>
          <p className="mt-1 text-sm text-red-800">
            Permanently remove this listing. Customers will no longer be able to view it.
          </p>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
            className="mt-4"
          >
            {deleting ? "Deleting..." : "Delete property"}
          </Button>
        </section>
      ) : null}

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
