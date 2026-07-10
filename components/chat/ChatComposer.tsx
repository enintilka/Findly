"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Button, Textarea } from "@/components/ui/primitives";
import { readFileAsDataUrl } from "@/lib/validation";
import type { ChatAttachment } from "@/types/agency";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;

function createAttachmentId() {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface ChatComposerProps {
  accentClassName: string;
  placeholder?: string;
  initialDraft?: string;
  onSend: (payload: {
    body: string;
    attachments: ChatAttachment[];
  }) => boolean | void | Promise<boolean | void>;
}

export default function ChatComposer({
  accentClassName,
  placeholder = "Write a message...",
  initialDraft,
  onSend,
}: ChatComposerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialDraft) return;
    setDraft((current) => (current ? current : initialDraft));
  }, [initialDraft]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const next = [...attachments];

    for (const file of files) {
      if (next.length >= MAX_ATTACHMENTS) {
        setError(`You can attach up to ${MAX_ATTACHMENTS} files per message.`);
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" is too large. Each file must be under 5 MB.`);
        continue;
      }

      try {
        const url = await readFileAsDataUrl(file);
        next.push({
          id: createAttachmentId(),
          name: file.name,
          kind: file.type.startsWith("image/") ? "image" : "file",
          mimeType: file.type || undefined,
          url,
        });
      } catch {
        setError(`Could not read "${file.name}". Please try another file.`);
      }
    }

    setAttachments(next);
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((entry) => entry.id !== id));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body && attachments.length === 0) return;

    const sent = await Promise.resolve(onSend({ body, attachments }));
    if (sent === false) {
      setError("Could not send your message. Try a smaller attachment.");
      return;
    }

    setDraft("");
    setAttachments([]);
    setError("");
  }

  const canSend = Boolean(draft.trim()) || attachments.length > 0;

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 px-6 py-4">
      {attachments.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
            >
              {attachment.kind === "image" && attachment.url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={attachment.url}
                  alt=""
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                <span aria-hidden>📎</span>
              )}
              <span className="max-w-[140px] truncate">{attachment.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="rounded p-0.5 text-slate-400 hover:text-red-600"
                aria-label={`Remove ${attachment.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}

      <div className="flex items-end gap-3">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="ghost"
          className="shrink-0 self-end px-3"
          onClick={() => inputRef.current?.click()}
          aria-label="Attach photo or file"
        >
          <svg
            className="h-5 w-5 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </Button>
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={2}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!canSend}
          className={`self-end ${accentClassName}`}
        >
          Send
        </Button>
      </div>
    </form>
  );
}
