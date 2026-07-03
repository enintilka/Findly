"use client";

import type { AgencyListing, ListingImage } from "@/types/agency";
import { getListingImages } from "@/lib/listing-images";

export default function ListingPhotos({ listing }: { listing: AgencyListing }) {
  const images = getListingImages(listing);

  if (images.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-semibold text-slate-900">Photos</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image: ListingImage, index) => (
          <figure
            key={`${image.name}-${index}`}
            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
          >
            {image.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.url}
                alt={image.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center px-3 text-center text-xs text-slate-500">
                {image.name}
              </div>
            )}
            <figcaption className="truncate px-2 py-1.5 text-xs text-slate-500">
              {image.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
