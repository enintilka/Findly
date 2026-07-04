const STORAGE_KEY = "findly-auth-rate-limit-until";

export function getAuthRateLimitRemainingMs(): number {
  if (typeof window === "undefined") return 0;
  window.sessionStorage.removeItem(STORAGE_KEY);
  return 0;
}

export function setAuthRateLimitCooldown(_cooldownMs?: number): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function clearAuthRateLimitCooldown(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function formatAuthRateLimitWait(_ms: number): string {
  return "0 seconds";
}
