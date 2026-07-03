const STORAGE_KEY = "findly-auth-rate-limit-until";
const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000;

export function getAuthRateLimitRemainingMs(): number {
  if (typeof window === "undefined") return 0;

  const until = window.sessionStorage.getItem(STORAGE_KEY);
  if (!until) return 0;

  return Math.max(0, Number(until) - Date.now());
}

export function setAuthRateLimitCooldown(
  cooldownMs = DEFAULT_COOLDOWN_MS,
): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    STORAGE_KEY,
    String(Date.now() + cooldownMs),
  );
}

export function formatAuthRateLimitWait(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds} second${seconds === 1 ? "" : "s"}`;
  }

  if (seconds === 0) {
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  return `${minutes} minute${minutes === 1 ? "" : "s"} ${seconds} second${seconds === 1 ? "" : "s"}`;
}
