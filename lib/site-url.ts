/**
 * Resolve the public site origin for auth redirects and emails.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (set this on Vercel for custom domains)
 * 2. Request Origin / forwarded host headers
 * 3. VERCEL_URL (automatic on Vercel deployments)
 * 4. localhost (local dev only)
 */
export function getPublicSiteOrigin(request?: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (request) {
    const origin = request.headers.get("origin");
    if (origin) return origin.replace(/\/$/, "");

    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (host) {
      const hostname = host.split(",")[0]?.trim();
      const proto =
        request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
        (hostname?.includes("localhost") ? "http" : "https");
      return `${proto}://${hostname}`;
    }
  }

  const vercelUrl = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercelUrl) {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}

export function getPasswordResetRedirectUrl(request?: Request): string {
  return `${getPublicSiteOrigin(request)}/auth/reset-password`;
}
