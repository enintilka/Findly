"use client";

import Link from "next/link";
import { resolveChatAttachments } from "@/lib/chat-attachments";
import { rewriteListingLinkForViewer } from "@/lib/listing-routes";
import { splitTextWithLinks } from "@/lib/linkify";
import type { ChatAttachment, ChatMessage } from "@/types/agency";

function LinkifiedText({
  text,
  isMine,
  viewerRole,
}: {
  text: string;
  isMine: boolean;
  viewerRole: "customer" | "agency";
}) {
  const segments = splitTextWithLinks(text);
  const linkClassName = isMine
    ? "font-medium underline decoration-white/70 underline-offset-2 hover:text-white"
    : "font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700";

  return (
    <p className="whitespace-pre-wrap break-words">
      {segments.map((segment, index) => {
        if (segment.type !== "link") {
          return <span key={`text-${index}`}>{segment.value}</span>;
        }

        const href = rewriteListingLinkForViewer(segment.href, viewerRole);
        const isInternal = href.startsWith("/");

        if (isInternal) {
          return (
            <Link key={`${href}-${index}`} href={href} className={linkClassName}>
              {segment.value}
            </Link>
          );
        }

        return (
          <a
            key={`${href}-${index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            {segment.value}
          </a>
        );
      })}
    </p>
  );
}

function AttachmentPreview({
  attachment,
  isMine,
}: {
  attachment: ChatAttachment;
  isMine: boolean;
}) {
  if (attachment.kind === "image" && attachment.url) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-h-52 max-w-full rounded-lg border border-black/10 object-cover"
        />
      </a>
    );
  }

  if (attachment.url) {
    return (
      <a
        href={attachment.url}
        download={attachment.name}
        className={`mt-2 inline-flex max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
          isMine
            ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        <svg
          className="h-4 w-4 shrink-0"
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
        <span className="truncate">{attachment.name}</span>
      </a>
    );
  }

  return (
    <p
      className={`mt-2 text-xs ${isMine ? "text-white/70" : "text-slate-500"}`}
    >
      {attachment.name} (file unavailable)
    </p>
  );
}

export default function ChatMessageContent({
  message,
  isMine,
  viewerRole,
}: {
  message: ChatMessage;
  isMine: boolean;
  viewerRole: "customer" | "agency";
}) {
  const attachments = resolveChatAttachments(
    message.id,
    message.attachments ?? [],
  );

  return (
    <div className="space-y-1">
      {message.body.trim() ? (
        <LinkifiedText
          text={message.body}
          isMine={isMine}
          viewerRole={viewerRole}
        />
      ) : null}
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.id}
          attachment={attachment}
          isMine={isMine}
        />
      ))}
    </div>
  );
}
