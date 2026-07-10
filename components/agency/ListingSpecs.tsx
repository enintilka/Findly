"use client";

import {
  formatPropertyDetailLines,
  getPropertyTypeFormConfig,
  getSingleSizeLabel,
} from "@/lib/request-property-config";
import {
  AMENITY_LABELS,
  PROPERTY_TYPE_LABELS,
  type RequestAmenities,
} from "@/types/customer";
import type { AgencyListing } from "@/types/agency";

export default function ListingSpecs({ listing }: { listing: AgencyListing }) {
  const config = getPropertyTypeFormConfig(listing.propertyType);
  const size = listing.sizeMax ?? listing.sizeMin;
  const detailLines = formatPropertyDetailLines(listing.propertyDetails);
  const activeAmenities = (
    Object.keys(AMENITY_LABELS) as Array<keyof RequestAmenities>
  ).filter((key) => listing.amenities[key]);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Property details</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Type</dt>
            <dd className="font-medium text-slate-900">
              {PROPERTY_TYPE_LABELS[listing.propertyType]}
            </dd>
          </div>
          {size ? (
            <div className="flex justify-between">
              <dt className="text-slate-500">
                {getSingleSizeLabel(listing.propertyType)}
              </dt>
              <dd className="font-medium text-slate-900">{size} m²</dd>
            </div>
          ) : null}
          {config.showBedrooms && listing.bedrooms ? (
            <div className="flex justify-between">
              <dt className="text-slate-500">{config.bedroomsLabel}</dt>
              <dd className="font-medium text-slate-900">{listing.bedrooms}</dd>
            </div>
          ) : null}
          {config.showBathrooms && listing.bathrooms ? (
            <div className="flex justify-between">
              <dt className="text-slate-500">{config.bathroomsLabel}</dt>
              <dd className="font-medium text-slate-900">{listing.bathrooms}</dd>
            </div>
          ) : null}
          {detailLines.map((line) => (
            <div key={line} className="flex justify-between gap-4">
              <dt className="shrink-0 text-slate-500">{line.split(": ")[0]}</dt>
              <dd className="text-right font-medium text-slate-900">
                {line.includes(": ") ? line.split(": ").slice(1).join(": ") : line}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Amenities</h2>
        {activeAmenities.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No amenities listed.</p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2">
            {activeAmenities.map((key) => (
              <li
                key={key}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
              >
                {AMENITY_LABELS[key]}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
