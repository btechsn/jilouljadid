/**
 * Fetch serveur vers l’API Laravel.
 * Plusieurs bases (fallback) + timeout large : `php artisan serve`
 * enfile les requêtes parallèles, ce qui peut facilement dépasser 4 s.
 */

const API_BASES = [
  // Local d'abord : ne jamais préférer la prod en dev (sinon liste ≠ BO).
  "http://127.0.0.1:8000/api/v1",
  "http://localhost:8000/api/v1",
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, ""),
  process.env.INTERNAL_API_URL?.replace(/\/$/, ""),
].filter((base, index, all): base is string => Boolean(base) && all.indexOf(base) === index);

const DEFAULT_REVALIDATE = 60;
const DEFAULT_TIMEOUT_MS = 20000;

export async function serverApiFetch<T = unknown>(
  path: string,
  init?: RequestInit & {
    revalidate?: number | false;
    timeoutMs?: number;
    locale?: string;
  },
): Promise<T | null> {
  const { revalidate = DEFAULT_REVALIDATE, timeoutMs = DEFAULT_TIMEOUT_MS, locale, ...rest } =
    init ?? {};
  const suffix = path.startsWith("/") ? path : `/${path}`;

  for (const base of API_BASES) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${base}${suffix}`, {
        ...rest,
        headers: {
          Accept: "application/json",
          ...(locale ? { "Accept-Language": locale } : {}),
          ...(rest.headers ?? {}),
        },
        signal: controller.signal,
        ...(revalidate === false
          ? { cache: "no-store" as const }
          : { next: { revalidate } }),
      });
      if (!response.ok) continue;
      return (await response.json()) as T;
    } catch {
      continue;
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}
