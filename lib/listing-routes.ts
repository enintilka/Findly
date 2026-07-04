const AGENCY_LISTING_PATH = /^\/agency\/listings\/([^/?#]+)\/?$/;
const CUSTOMER_LISTING_PATH = /^\/customer\/listings\/([^/?#]+)\/?$/;

function getPathname(href: string): string {
  try {
    return new URL(href).pathname;
  } catch {
    const withoutQuery = href.split("?")[0]?.split("#")[0] ?? href;
    const listingPath = withoutQuery.match(
      /(\/(?:agency|customer)\/listings\/[^/?#]+)/,
    )?.[1];
    if (listingPath) return listingPath;
    return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  }
}

export function getListingPathForRole(
  listingId: string,
  role: "customer" | "agency",
): string {
  return role === "customer"
    ? `/customer/listings/${listingId}`
    : `/agency/listings/${listingId}`;
}

export function extractListingIdFromPath(pathname: string): string | null {
  const agencyMatch = pathname.match(AGENCY_LISTING_PATH);
  if (agencyMatch?.[1]) return agencyMatch[1];

  const customerMatch = pathname.match(CUSTOMER_LISTING_PATH);
  if (customerMatch?.[1]) return customerMatch[1];

  return null;
}

export function rewriteListingLinkForViewer(
  href: string,
  viewerRole: "customer" | "agency",
): string {
  const pathname = getPathname(href);
  const listingId = extractListingIdFromPath(pathname);
  if (!listingId) {
    return href;
  }

  // Always stay on the current origin (avoids losing session on cross-host links).
  return getListingPathForRole(listingId, viewerRole);
}
