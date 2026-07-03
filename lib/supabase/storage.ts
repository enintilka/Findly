import { createClient } from "@/lib/supabase";

export type StoredFile = {
  name: string;
  path: string;
};

export function notifyPlatformChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("findly-platform-change"));
  window.dispatchEvent(new Event("findly-customer-change"));
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; contentType: string } {
  const [header, base64] = dataUrl.split(",");
  const contentType = header.match(/:(.*?);/)?.[1] ?? "application/octet-stream";
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) {
    buffer[i] = bytes.charCodeAt(i);
  }
  return { blob: new Blob([buffer], { type: contentType }), contentType };
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}

export function getPublicFileUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadDataUrlFile(
  bucket: string,
  path: string,
  dataUrl: string,
): Promise<void> {
  const supabase = createClient();
  const { blob, contentType } = dataUrlToBlob(dataUrl);
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    upsert: true,
    contentType,
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function persistImageFiles(
  bucket: string,
  basePath: string,
  images: Array<{ name: string; url: string; storagePath?: string }>,
): Promise<StoredFile[]> {
  const stored: StoredFile[] = [];

  for (const image of images) {
    if (image.storagePath) {
      stored.push({ name: image.name, path: image.storagePath });
      continue;
    }

    if (image.url.startsWith("data:")) {
      const path = `${basePath}/${crypto.randomUUID()}-${sanitizeFileName(image.name)}`;
      await uploadDataUrlFile(bucket, path, image.url);
      stored.push({ name: image.name, path });
      continue;
    }

    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = image.url.indexOf(marker);
    if (index >= 0) {
      stored.push({
        name: image.name,
        path: decodeURIComponent(image.url.slice(index + marker.length)),
      });
    }
  }

  return stored;
}

export function storedFilesToImages(
  bucket: string,
  files: StoredFile[],
): Array<{ name: string; url: string; storagePath: string }> {
  return files.map((file) => ({
    name: file.name,
    storagePath: file.path,
    url: getPublicFileUrl(bucket, file.path),
  }));
}

export async function persistChatAttachments(
  threadId: string,
  messageId: string,
  attachments: Array<{
    id: string;
    name: string;
    kind: "image" | "file";
    mimeType?: string;
    url?: string;
    storagePath?: string;
  }>,
): Promise<
  Array<{
    id: string;
    name: string;
    kind: "image" | "file";
    mimeType?: string;
    path: string;
  }>
> {
  const stored = [];

  for (const attachment of attachments) {
    if (attachment.storagePath) {
      stored.push({
        id: attachment.id,
        name: attachment.name,
        kind: attachment.kind,
        mimeType: attachment.mimeType,
        path: attachment.storagePath,
      });
      continue;
    }

    if (!attachment.url?.startsWith("data:")) {
      continue;
    }

    const path = `${threadId}/${messageId}/${attachment.id}-${sanitizeFileName(attachment.name)}`;
    await uploadDataUrlFile("chat-attachments", path, attachment.url);
    stored.push({
      id: attachment.id,
      name: attachment.name,
      kind: attachment.kind,
      mimeType: attachment.mimeType,
      path,
    });
  }

  return stored;
}

export function storedAttachmentsToChat(
  attachments: Array<{
    id: string;
    name: string;
    kind: "image" | "file";
    mimeType?: string;
    path: string;
  }>,
) {
  return attachments.map((attachment) => ({
    id: attachment.id,
    name: attachment.name,
    kind: attachment.kind,
    mimeType: attachment.mimeType,
    storagePath: attachment.path,
    url: getPublicFileUrl("chat-attachments", attachment.path),
  }));
}
