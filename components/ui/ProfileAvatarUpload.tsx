"use client";

import { ChangeEvent, useState } from "react";
import { Label } from "@/components/ui/primitives";
import { readFileAsDataUrl } from "@/lib/validation";

interface ProfileAvatarUploadProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
  fallbackInitial?: string;
}

export default function ProfileAvatarUpload({
  value,
  onChange,
  label = "Profile picture",
  fallbackInitial = "?",
}: ProfileAvatarUploadProps) {
  const [error, setError] = useState("");

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2 MB.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError("Could not read the image. Please try again.");
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-xl font-semibold text-slate-500">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            fallbackInitial.charAt(0).toUpperCase()
          )}
        </div>
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
          />
          {value ? (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Remove photo
            </button>
          ) : null}
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
