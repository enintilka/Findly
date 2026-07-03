"use client";

import { ChangeEvent, useState } from "react";
import { Label } from "@/components/ui/primitives";
import { readFileAsDataUrl } from "@/lib/validation";
import type { ListingImage } from "@/types/agency";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 8;

interface ListingPhotoUploadProps {
  images: ListingImage[];
  onImagesChange: (images: ListingImage[]) => void;
}

export default function ListingPhotoUpload({
  images,
  onImagesChange,
}: ListingPhotoUploadProps) {
  const [error, setError] = useState("");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    const nextImages = [...images];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" is not supported. Upload photos only (JPG, PNG, WebP).`);
        continue;
      }
      if (nextImages.length >= MAX_IMAGES) {
        setError(`You can upload up to ${MAX_IMAGES} photos.`);
        break;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setError(`"${file.name}" is too large. Each photo must be under 5 MB.`);
        continue;
      }

      try {
        const url = await readFileAsDataUrl(file);
        nextImages.push({ name: file.name, url });
      } catch {
        setError(`Could not read "${file.name}". Please try another photo.`);
      }
    }

    onImagesChange(nextImages);
  }

  function removeImage(index: number) {
    onImagesChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="listing-photos">Photos</Label>
        <input
          id="listing-photos"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/*"
          multiple
          onChange={handleFileChange}
          className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-violet-700"
        />
        <p className="mt-2 text-xs text-slate-500">
          Add property photos (up to {MAX_IMAGES}, 5 MB each).
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={`${image.name}-${index}`}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.name}
                className="aspect-square w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100"
                aria-label={`Remove ${image.name}`}
              >
                Remove
              </button>
              <p className="truncate px-2 py-1.5 text-xs text-slate-500">{image.name}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
