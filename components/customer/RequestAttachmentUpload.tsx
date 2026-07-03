"use client";

import { ChangeEvent, useState } from "react";
import { Label } from "@/components/ui/primitives";
import { readFileAsDataUrl } from "@/lib/validation";
import type { RequestImage } from "@/types/customer";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 8;

interface RequestAttachmentUploadProps {
  images: RequestImage[];
  pdfNames: string[];
  onImagesChange: (images: RequestImage[]) => void;
  onPdfNamesChange: (names: string[]) => void;
}

export default function RequestAttachmentUpload({
  images,
  pdfNames,
  onImagesChange,
  onPdfNamesChange,
}: RequestAttachmentUploadProps) {
  const [error, setError] = useState("");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    const nextImages = [...images];
    const nextPdfs = [...pdfNames];

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        if (nextImages.length >= MAX_IMAGES) {
          setError(`You can upload up to ${MAX_IMAGES} photos.`);
          continue;
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
        continue;
      }

      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        if (!nextPdfs.includes(file.name)) {
          nextPdfs.push(file.name);
        }
        continue;
      }

      setError(`"${file.name}" is not supported. Upload photos (JPG, PNG, WebP) or PDF files.`);
    }

    onImagesChange(nextImages);
    onPdfNamesChange(nextPdfs);
  }

  function removeImage(index: number) {
    onImagesChange(images.filter((_, i) => i !== index));
  }

  function removePdf(name: string) {
    onPdfNamesChange(pdfNames.filter((pdf) => pdf !== name));
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="attachments">Photos & PDFs</Label>
        <input
          id="attachments"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/*,application/pdf,.pdf"
          multiple
          onChange={handleFileChange}
          className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700"
        />
        <p className="mt-2 text-xs text-slate-500">
          Add reference photos (up to {MAX_IMAGES}, 5 MB each) or PDF documents.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {images.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Photos</p>
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
        </div>
      ) : null}

      {pdfNames.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">PDF documents</p>
          <ul className="space-y-2">
            {pdfNames.map((name) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                <span className="truncate">{name}</span>
                <button
                  type="button"
                  onClick={() => removePdf(name)}
                  className="ml-3 shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
