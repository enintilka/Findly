"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import {
  FieldGroup,
  FormSection,
} from "@/components/customer/FormSection";
import { createCustomerRequest } from "@/lib/customer-store";
import {
  AMENITY_LABELS,
  EMPTY_AMENITIES,
  PROPERTY_TYPE_LABELS,
  type PropertyType,
  type RequestAmenities,
} from "@/types/customer";
import { Button, FormError, Input, Label, Select, Textarea } from "@/components/ui/primitives";
import { validateRequiredFields } from "@/lib/validation";

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
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50/50"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(id, event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

export default function CustomerRequestForm() {
  const router = useRouter();
  const { customer } = useCustomerAuth();
  const [error, setError] = useState("");
  const [amenities, setAmenities] = useState<RequestAmenities>(EMPTY_AMENITIES);
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [pdfNames, setPdfNames] = useState<string[]>([]);

  function handleAmenityChange(key: keyof RequestAmenities, value: boolean) {
    setAmenities((current) => ({ ...current, [key]: value }));
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
    type: "image" | "pdf",
  ) {
    const files = Array.from(event.target.files ?? []);
    const names = files.map((file) => file.name);

    if (type === "image") setImageNames(names);
    else setPdfNames(names);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer) return;
    setError("");

    const form = new FormData(event.currentTarget);
    const introduction = String(form.get("introduction")).trim();
    const country = String(form.get("country")).trim();
    const region = String(form.get("region")).trim();
    const city = String(form.get("city")).trim();
    const budgetMin = Number(form.get("budgetMin"));
    const budgetMax = Number(form.get("budgetMax"));

    const requiredErrors = validateRequiredFields(
      { introduction, country, region, city },
      {
        introduction: "Your message",
        country: "Country",
        region: "Region",
        city: "City",
      },
    );

    if (requiredErrors.length > 0) {
      setError(requiredErrors[0]);
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

    createCustomerRequest(customer, {
      introduction,
      propertyType: String(form.get("propertyType")) as PropertyType,
      country,
      region,
      city,
      budgetMin,
      budgetMax,
      sizeMin: Number(form.get("sizeMin")) || undefined,
      sizeMax: Number(form.get("sizeMax")) || undefined,
      bedrooms: Number(form.get("bedrooms")) || undefined,
      bathrooms: Number(form.get("bathrooms")) || undefined,
      amenities,
      additionalNotes: String(form.get("additionalNotes")) || undefined,
      imageNames,
      pdfNames,
    });

    router.push("/customer/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error ? <FormError message={error} /> : null}

      <FormSection
        title="Introduce yourself"
        description="Write naturally, like you're telling an agency what you're looking for."
      >
        <Label htmlFor="introduction" required>
          Your message
        </Label>
        <Textarea
          id="introduction"
          name="introduction"
          required
          rows={6}
          placeholder={`Hi, I'm ${customer?.name ?? "..."}. I'm looking for a vacation house in Italy, preferably close to the sea. My budget is €130,000...`}
          className="mt-1.5"
        />
      </FormSection>

      <FormSection title="Location">
        <FieldGroup columns={3}>
          <div>
            <Label htmlFor="country" required>
              Country
            </Label>
            <Input id="country" name="country" required placeholder="Italy" />
          </div>
          <div>
            <Label htmlFor="region" required>
              Region
            </Label>
            <Input id="region" name="region" required placeholder="Tuscany" />
          </div>
          <div>
            <Label htmlFor="city" required>
              City
            </Label>
            <Input id="city" name="city" required placeholder="Lucca" />
          </div>
        </FieldGroup>
      </FormSection>

      <FormSection title="Property details">
        <FieldGroup columns={2}>
          <div>
            <Label htmlFor="propertyType" required>
              Property type
            </Label>
            <Select id="propertyType" name="propertyType" required defaultValue="vacation_home">
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
            <Input id="budgetMin" name="budgetMin" type="number" required min={0} placeholder="100000" />
          </div>
          <div>
            <Label htmlFor="budgetMax" required>
              Budget max (€)
            </Label>
            <Input id="budgetMax" name="budgetMax" type="number" required min={0} placeholder="130000" />
          </div>
          <div>
            <Label htmlFor="sizeMin">Size min (m²)</Label>
            <Input id="sizeMin" name="sizeMin" type="number" min={0} placeholder="50" />
          </div>
          <div>
            <Label htmlFor="sizeMax">Size max (m²)</Label>
            <Input id="sizeMax" name="sizeMax" type="number" min={0} placeholder="60" />
          </div>
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input id="bedrooms" name="bedrooms" type="number" min={0} placeholder="2" />
          </div>
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input id="bathrooms" name="bathrooms" type="number" min={0} placeholder="1" />
          </div>
        </FieldGroup>
      </FormSection>

      <FormSection
        title="Amenities & preferences"
        description="Select anything you'd like. Leave unchecked if it doesn't matter."
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

      <FormSection title="Additional notes">
        <Label htmlFor="additionalNotes">Anything else agencies should know?</Label>
        <Textarea
          id="additionalNotes"
          name="additionalNotes"
          rows={4}
          placeholder="Flexible on move-in date, prefer ground floor, etc."
          className="mt-1.5"
        />
      </FormSection>

      <FormSection
        title="Attachments (optional)"
        description="Upload reference images or PDFs. Files stay on your device for now — only names are saved in this demo."
      >
        <FieldGroup columns={2}>
          <div>
            <Label htmlFor="images">Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => handleFileChange(event, "image")}
              className="mt-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700"
            />
            {imageNames.length > 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                {imageNames.length} file(s) selected
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="pdfs">PDF documents</Label>
            <Input
              id="pdfs"
              type="file"
              accept="application/pdf"
              multiple
              onChange={(event) => handleFileChange(event, "pdf")}
              className="mt-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700"
            />
            {pdfNames.length > 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                {pdfNames.length} file(s) selected
              </p>
            ) : null}
          </div>
        </FieldGroup>
      </FormSection>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/customer/dashboard")}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
          Publish request
        </Button>
      </div>
    </form>
  );
}
