"use client";

import type { CustomerRequest, RequestImage } from "@/types/customer";
import { getRequestImages } from "@/lib/request-images";

export default function RequestAttachments({
  request,
}: {
  request: CustomerRequest;
}) {
  const images = getRequestImages(request);
  const pdfs = request.pdfNames ?? [];

  if (images.length === 0 && pdfs.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-semibold text-slate-900">Attachments</h2>

      {images.length > 0 ? (
        <div className="mt-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Photos</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image: RequestImage, index: number) => (
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
        </div>
      ) : null}

      {pdfs.length > 0 ? (
        <ul className={`space-y-2 text-sm text-slate-600 ${images.length > 0 ? "mt-4" : "mt-3"}`}>
          {pdfs.map((name) => (
            <li key={name} className="rounded-lg bg-slate-50 px-3 py-2">
              PDF: {name}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
