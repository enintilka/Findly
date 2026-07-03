const AGENCY_LISTING_PATH = /^\/agency\/listings\/([^/?#]+)\/?$/;

export function getListingPathForRole(
  listingId: string,
  role: "customer" | "agency",
): string {
  return role === "customer"
    ? `/customer/listings/${listingId}`
    : `/agency/listings/${listingId}`;
}

export function extractListingIdFromPath(pathname: string): string | null {
  const match = pathname.match(AGENCY_LISTING_PATH);
  return match?.[1] ?? null;
}

export function rewriteListingLinkForViewer(
  href: string,
  viewerRole: "customer" | "agency",
): string {
  if (viewerRole !== "customer") {
    return href;
  }

  try {
    const parsed = new URL(href);
    const listingId = extractListingIdFromPath(parsed.pathname);
    if (!listingId) {
      return href;
    }

    parsed.pathname = `/customer/listings/${listingId}`;
    return parsed.toString();
  } catch {
    const listingId = extractListingIdFromPath(href);
    if (!listingId) {
      return href;
    }

    return `/customer/listings/${listingId}`;
  }
}
