"use client";

import { getPropertyTypeFormConfig } from "@/lib/request-property-config";
import { PROPERTY_TYPE_LABELS, type PropertyType } from "@/types/customer";

export default function PropertyTypeFieldHint({
  propertyType,
  theme = "agency",
}: {
  propertyType: PropertyType;
  theme?: "agency" | "customer";
}) {
  const config = getPropertyTypeFormConfig(propertyType);
  const hasSpecializedFields =
    !config.showBedrooms || config.extraFields.length > 0;

  const borderClass =
    theme === "agency"
      ? "border-violet-200 bg-violet-50 text-violet-900"
      : "border-indigo-200 bg-indigo-50 text-indigo-900";

  if (!hasSpecializedFields) {
    return (
      <p className="text-sm text-slate-500">
        Select <strong className="text-slate-700">Land</strong> or{" "}
        <strong className="text-slate-700">Commercial</strong> to show plot,
        zoning, or business-use fields instead of bedrooms.
      </p>
    );
  }

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${borderClass}`}>
      Showing <strong>{PROPERTY_TYPE_LABELS[propertyType]}</strong> fields
      {config.extraFields.length > 0
        ? ` — scroll down for ${propertyType === "land" ? "land" : "commercial"} details below.`
        : "."}
      {!config.showBedrooms ? " Bedrooms and bathrooms are hidden for this type." : ""}
    </div>
  );
}
