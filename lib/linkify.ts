export type TextSegment =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string };

const TRAILING_PUNCTUATION = /[.,;:!?)}\]'"]+$/;

function normalizeHref(value: string): string {
  return value.startsWith("www.") ? `https://${value}` : value;
}

const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<]+/gi;
const LISTING_PATH_PATTERN = /\/agency\/listings\/[^\s/?#]+/gi;

export function splitTextWithLinks(text: string): TextSegment[] {
  const pattern = new RegExp(
    `${URL_PATTERN.source}|${LISTING_PATH_PATTERN.source}`,
    "gi",
  );
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const raw = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, start) });
    }

    const trailing = raw.match(TRAILING_PUNCTUATION)?.[0] ?? "";
    const url = trailing ? raw.slice(0, -trailing.length) : raw;

    const href = url.startsWith("/") ? url : normalizeHref(url);

    segments.push({
      type: "link",
      value: url,
      href,
    });

    if (trailing) {
      segments.push({ type: "text", value: trailing });
    }

    lastIndex = start + raw.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: "text", value: text });
  }

  return segments;
}
