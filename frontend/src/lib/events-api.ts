import type { EventCard } from "@/components/mosque/event-board";
import { getJiloulEvent } from "@/lib/jiloul-events";
import { toPublicMediaUrl } from "@/lib/media";
import { serverApiFetch } from "@/lib/server-api";

type ApiEvent = {
  id: string;
  title?: Record<string, string> | string;
  title_localized?: string;
  description?: Record<string, string> | string;
  description_localized?: string;
  description_html?: string;
  type?: string;
  start_at?: string | null;
  location?: string | null;
  image_url?: string | null;
  gallery_urls?: string[] | null;
  youtube_url?: string | null;
  is_finished?: boolean;
  can_register?: boolean;
  requires_registration?: boolean;
  is_featured?: boolean;
  status?: string;
};

function pickLocalized(
  value: Record<string, string> | string | undefined,
  locale: string,
  fallback = "",
): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  const preferred = locale === "en" || locale === "ar" ? value[locale] : value.fr;
  return (preferred || value.fr || Object.values(value)[0] || fallback).trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function mapApiEvent(raw: ApiEvent, locale: string): EventCard {
  const title =
    raw.title_localized?.trim() ||
    pickLocalized(typeof raw.title === "object" ? raw.title : undefined, locale, "Événement");
  const html =
    raw.description_html?.trim() ||
    pickLocalized(typeof raw.description === "object" ? raw.description : undefined, locale);
  const description =
    raw.description_localized?.trim() ||
    stripHtml(html) ||
    pickLocalized(typeof raw.description === "object" ? raw.description : undefined, locale);

  const finished =
    raw.is_finished === true ||
    raw.status === "completed" ||
    (!!raw.start_at && new Date(raw.start_at).getTime() < Date.now() && raw.status !== "ongoing");

  return {
    id: raw.id,
    title,
    description,
    body: html || description,
    type: raw.type || "other",
    startAt: raw.start_at || "",
    location: raw.location || "",
    image: toPublicMediaUrl(raw.image_url, "/brand/slide-centre.jpg"),
    isFinished: finished,
    canRegister: raw.can_register === true,
    youtubeUrl: raw.youtube_url || "",
    gallery: (() => {
      const fromApi = Array.isArray(raw.gallery_urls)
        ? raw.gallery_urls.map((url) => toPublicMediaUrl(url)).filter(Boolean)
        : [];
      if (fromApi.length > 0) return fromApi;
      const cover = toPublicMediaUrl(raw.image_url);
      return cover ? [cover] : undefined;
    })(),
    featured: raw.is_featured === true,
  };
}

function sortEvents(events: EventCard[]): EventCard[] {
  return [...events].sort((a, b) => {
    if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
    if (a.isFinished !== b.isFinished) return a.isFinished ? 1 : -1;
    return (a.startAt || "").localeCompare(b.startAt || "");
  });
}

/** Uniquement les événements du back-office (API). */
export async function loadEvents(locale: string): Promise<EventCard[]> {
  const body = await serverApiFetch<{ data?: ApiEvent[] }>("/mosque/events", {
    timeoutMs: 8000,
    revalidate: false,
    locale,
  });

  if (!Array.isArray(body?.data)) {
    return [];
  }

  return sortEvents(body.data.map((item) => mapApiEvent(item, locale)));
}

function clientApiBase(): string {
  // Même origine via rewrite Next → Laravel (évite prod / CORS).
  if (typeof window !== "undefined") {
    return "/api/v1";
  }
  return (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");
}

/**
 * Fetch navigateur (évite le cache SSR / URL de prod).
 * `null` = échec réseau ; `[]` = BO sans événements.
 */
export async function fetchEventsClient(locale: string): Promise<EventCard[] | null> {
  try {
    const response = await fetch(`${clientApiBase()}/mosque/events`, {
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
      },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: ApiEvent[] };
    if (!Array.isArray(body?.data)) return null;
    return sortEvents(body.data.map((item) => mapApiEvent(item, locale)));
  } catch {
    return null;
  }
}

export async function loadEvent(locale: string, id: string): Promise<EventCard | null> {
  const body = await serverApiFetch<{ data?: ApiEvent }>(`/mosque/events/${encodeURIComponent(id)}`, {
    timeoutMs: 8000,
    revalidate: false,
    locale,
  });

  if (body?.data) {
    return mapApiEvent(body.data, locale);
  }

  // Anciens liens /evenements/ansaroudine etc. (À propos)
  return getJiloulEvent(locale, id) ?? null;
}

export async function fetchEventClient(locale: string, id: string): Promise<EventCard | null> {
  try {
    const response = await fetch(`${clientApiBase()}/mosque/events/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json", "Accept-Language": locale },
      cache: "no-store",
    });
    if (response.ok) {
      const body = (await response.json()) as { data?: ApiEvent };
      if (body?.data) return mapApiEvent(body.data, locale);
    }
  } catch {
    /* ignore */
  }
  return getJiloulEvent(locale, id) ?? null;
}
