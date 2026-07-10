"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import RequestAttachmentUpload from "@/components/customer/RequestAttachmentUpload";
import {
  FieldGroup,
  FormSection,
} from "@/components/customer/FormSection";
import { createCustomerRequest, deleteCustomerRequest, updateCustomerRequest } from "@/lib/customer-store";
import {
  collectPropertyDetails,
  filterAmenitiesForPropertyType,
  getPropertyTypeFormConfig,
  PROPERTY_TYPE_FORM_CONFIG,
  type ExtraField,
} from "@/lib/request-property-config";
import {
  AMENITY_LABELS,
  EMPTY_AMENITIES,
  PROPERTY_TYPE_LABELS,
  type PropertyType,
  type RequestAmenities,
  type RequestImage,
  type RequestPropertyDetails,
  type CustomerRequest,
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

function ExtraFieldInput({
  field,
  details,
}: {
  field: ExtraField;
  details?: RequestPropertyDetails;
}) {
  const name = `detail_${field.key}`;
  const defaultValue = details?.[field.key];

  if (field.type === "checkbox") {
    return (
      <label
        htmlFor={name}
        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50/50"
      >
        <input
          id={name}
          name={name}
          type="checkbox"
          defaultChecked={Boolean(defaultValue)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm font-medium text-slate-700">{field.label}</span>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <Label htmlFor={name}>{field.label}</Label>
        <Select
          id={name}
          name={name}
          defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
        >
          <option value="">Select…</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={name}>{field.label}</Label>
      <Input
        id={name}
        name={name}
        type={field.type}
        min={field.type === "number" ? 0 : undefined}
        defaultValue={
          defaultValue !== undefined && defaultValue !== false
            ? String(defaultValue)
            : ""
        }
        placeholder={field.placeholder}
      />
    </div>
  );
}

export default function CustomerRequestForm({
  request,
}: {
  request?: CustomerRequest;
}) {
  const router = useRouter();
  const { customer } = useCustomerAuth();
  const isEdit = Boolean(request);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [propertyType, setPropertyType] = useState<PropertyType>(
    request?.propertyType ?? "vacation_home",
  );
  const formConfig = getPropertyTypeFormConfig(propertyType);
  const [amenities, setAmenities] = useState<RequestAmenities>(
    request?.amenities ?? EMPTY_AMENITIES,
  );
  const [images, setImages] = useState<RequestImage[]>(request?.images ?? []);
  const [pdfNames, setPdfNames] = useState<string[]>(request?.pdfNames ?? []);

  useEffect(() => {
    setAmenities((current) => filterAmenitiesForPropertyType(propertyType, current));
  }, [propertyType]);

  function handlePropertyTypeChange(value: PropertyType) {
    setPropertyType(value);
  }

  function handleAmenityChange(key: keyof RequestAmenities, value: boolean) {
    setAmenities((current) => ({ ...current, [key]: value }));
  }

  async function handleDelete() {
    if (!customer || !request || deleting) return;

    const confirmed = confirm(
      "Delete this request permanently? Agencies will no longer see it and related chats will be removed.",
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteCustomerRequest(customer.id, request.id);
      router.push("/customer/dashboard");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this request.",
      );
      setDeleting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    const selectedType = String(form.get("propertyType")) as PropertyType;
    const typeConfig = PROPERTY_TYPE_FORM_CONFIG[selectedType];

    const requiredErrors = validateRequiredFields(
      { introduction, country },
      {
        introduction: "Your message",
        country: "Country",
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

    try {
      const payload = {
        introduction,
        propertyType: selectedType,
        country,
        region,
        city,
        budgetMin,
        budgetMax,
        sizeMin: Number(form.get("sizeMin")) || undefined,
        sizeMax: Number(form.get("sizeMax")) || undefined,
        bedrooms: typeConfig.showBedrooms
          ? Number(form.get("bedrooms")) || undefined
          : undefined,
        bathrooms: typeConfig.showBathrooms
          ? Number(form.get("bathrooms")) || undefined
          : undefined,
        propertyDetails: collectPropertyDetails(form, selectedType),
        amenities: filterAmenitiesForPropertyType(selectedType, amenities),
        additionalNotes: String(form.get("additionalNotes")).trim() || undefined,
        images,
        pdfNames,
      };

      if (isEdit && request) {
        await updateCustomerRequest(customer.id, request.id, payload, customer.name);
        router.push(`/customer/requests/${request.id}`);
      } else {
        await createCustomerRequest(customer, payload);
        router.push("/customer/dashboard");
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save your request. Please try again.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6" key={request?.id ?? "new"}>
      {error ? <FormError message={error} /> : null}

      <FormSection
        title={isEdit ? "Your message" : "Introduce yourself"}
        description={
          isEdit
            ? "Update your introduction if anything has changed."
            : "Write naturally, like you're telling an agency what you're looking for."
        }
      >
        <Label htmlFor="introduction" required>
          Your message
        </Label>
        <Textarea
          id="introduction"
          name="introduction"
          required
          rows={6}
          defaultValue={request?.introduction ?? ""}
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
            <Input
              id="country"
              name="country"
              required
              defaultValue={request?.country ?? ""}
              placeholder="Italy"
            />
          </div>
          <div>
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              name="region"
              defaultValue={request?.region ?? ""}
              placeholder="Tuscany"
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              defaultValue={request?.city ?? ""}
              placeholder="Lucca"
            />
          </div>
        </FieldGroup>
      </FormSection>

      <FormSection
        title="Property details"
        description={formConfig.sectionDescription}
      >
        <FieldGroup columns={2}>
          <div>
            <Label htmlFor="propertyType" required>
              Property type
            </Label>
            <Select
              id="propertyType"
              name="propertyType"
              required
              value={propertyType}
              onChange={(event) =>
                handlePropertyTypeChange(event.target.value as PropertyType)
              }
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
              defaultValue={request?.budgetMin ?? ""}
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
              defaultValue={request?.budgetMax ?? ""}
              placeholder="130000"
            />
          </div>
          <div>
            <Label htmlFor="sizeMin">{formConfig.sizeMinLabel}</Label>
            <Input
              id="sizeMin"
              name="sizeMin"
              type="number"
              min={0}
              defaultValue={request?.sizeMin ?? ""}
              placeholder={formConfig.sizePlaceholder.min}
            />
          </div>
          <div>
            <Label htmlFor="sizeMax">{formConfig.sizeMaxLabel}</Label>
            <Input
              id="sizeMax"
              name="sizeMax"
              type="number"
              min={0}
              defaultValue={request?.sizeMax ?? ""}
              placeholder={formConfig.sizePlaceholder.max}
            />
          </div>
          {formConfig.showBedrooms ? (
            <div>
              <Label htmlFor="bedrooms">{formConfig.bedroomsLabel}</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min={0}
                defaultValue={request?.bedrooms ?? ""}
                placeholder="2"
              />
            </div>
          ) : null}
          {formConfig.showBathrooms ? (
            <div>
              <Label htmlFor="bathrooms">{formConfig.bathroomsLabel}</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min={0}
                defaultValue={request?.bathrooms ?? ""}
                placeholder="1"
              />
            </div>
          ) : null}
        </FieldGroup>

        {formConfig.extraFields.length > 0 ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm font-medium text-slate-700">
              {propertyType === "land" ? "Land details" : "Additional details"}
            </p>
            <FieldGroup columns={2}>
              {formConfig.extraFields.map((field) =>
                field.type === "checkbox" ? (
                  <ExtraFieldInput
                    key={field.key}
                    field={field}
                    details={request?.propertyDetails}
                  />
                ) : (
                  <div key={field.key}>
                    <ExtraFieldInput
                      field={field}
                      details={request?.propertyDetails}
                    />
                  </div>
                ),
              )}
            </FieldGroup>
          </div>
        ) : null}
      </FormSection>

      <FormSection
        title="Amenities & preferences"
        description="Select anything you'd like. Leave unchecked if it doesn't matter."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {formConfig.amenities.map((key) => (
            <AmenityCheckbox
              key={key}
              id={key}
              label={AMENITY_LABELS[key]}
              checked={amenities[key]}
              onChange={handleAmenityChange}
            />
          ))}
        </div>
      </FormSection>

      <FormSection title="Additional notes">
        <Label htmlFor="additionalNotes">Anything else agencies should know?</Label>
        <Textarea
          id="additionalNotes"
          name="additionalNotes"
          rows={4}
          defaultValue={request?.additionalNotes ?? ""}
          placeholder="Flexible on move-in date, prefer ground floor, etc."
          className="mt-1.5"
        />
      </FormSection>

      <FormSection
        title="Attachments (optional)"
        description="Add reference photos and PDF documents to help agencies understand what you want."
      >
        <RequestAttachmentUpload
          images={images}
          pdfNames={pdfNames}
          onImagesChange={setImages}
          onPdfNamesChange={setPdfNames}
        />
      </FormSection>

      {isEdit && request ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-sm font-semibold text-red-900">Delete this request</h2>
          <p className="mt-1 text-sm text-red-800">
            Permanently remove this request. Agencies will no longer see it.
          </p>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
            className="mt-4"
          >
            {deleting ? "Deleting..." : "Delete request"}
          </Button>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            router.push(
              isEdit && request
                ? `/customer/requests/${request.id}`
                : "/customer/dashboard",
            )
          }
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
          {isEdit ? "Save changes" : "Publish request"}
        </Button>
      </div>
    </form>
  );
}
