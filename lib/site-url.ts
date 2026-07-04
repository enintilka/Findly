/**
 * Resolve the public site origin for auth redirects and emails.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (set on Vercel — required for custom domains)
 * 2. Request Origin / Referer / forwarded host headers
 * 3. VERCEL_URL (automatic on Vercel deployments)
 * 4. localhost (local dev only)
 */
export function getPublicSiteOrigin(request?: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv && !isLocalhost(fromEnv)) return fromEnv;
  if (fromEnv && !isProductionDeployment()) return fromEnv;

  if (request) {
    for (const header of ["origin", "referer"] as const) {
      const value = request.headers.get(header);
      if (!value) continue;
      try {
        const parsed = new URL(value);
        if (!isLocalhost(parsed.origin) || !isProductionDeployment()) {
          return parsed.origin;
        }
      } catch {
        // ignore malformed header values
      }
    }

    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (host) {
      const hostname = host.split(",")[0]?.trim();
      if (hostname && (!isLocalhost(hostname) || !isProductionDeployment())) {
        const proto =
          request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
          (hostname.includes("localhost") ? "http" : "https");
        return `${proto}://${hostname}`;
      }
    }
  }

  const vercelUrl = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercelUrl) {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }

  if (isProductionDeployment()) {
    throw new Error(
      "Missing production site URL. Set NEXT_PUBLIC_SITE_URL on Vercel to your live app URL.",
    );
  }

  return "http://localhost:3000";
}

export function getPasswordResetRedirectUrl(request?: Request): string {
  return `${getPublicSiteOrigin(request)}/auth/reset-password`;
}

export function getPasswordResetConfirmUrl(
  tokenHash: string,
  request?: Request,
): string {
  const origin = getPublicSiteOrigin(request);
  const next = encodeURIComponent("/auth/reset-password");
  return `${origin}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=recovery&next=${next}`;
}

function isProductionDeployment(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

function isLocalhost(value: string): boolean {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value);
}
