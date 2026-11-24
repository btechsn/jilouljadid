/**
 * Convertit une URL média API (souvent http://127.0.0.1:8000/storage/…)
 * en chemin même origine /storage/… (rewrite Next → Laravel).
 */
export function toPublicMediaUrl(url: string | null | undefined, fallback = ""): string {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith("/storage/")) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/storage/")) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    /* relative non-/storage */
  }

  return trimmed;
}

export function isRemoteUpload(url: string): boolean {
  return url.startsWith("/storage/") || /^https?:\/\//i.test(url);
}
