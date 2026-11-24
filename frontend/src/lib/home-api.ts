import type { BannerSlide } from "@/components/layout/banner-slider";
import type { EventCard } from "@/components/mosque/event-board";
import type { PartnerLogo } from "@/components/layout/partners-marquee";
import type { TestimonialCard } from "@/components/layout/testimonials-carousel";
import { loadEvents } from "@/lib/events-api";
import { serverApiFetch } from "@/lib/server-api";

function formatEventEyebrow(startAt: string, locale: string): string {
  if (!startAt) return locale === "en" ? "Event" : locale === "ar" ? "فعالية" : "Événement";
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale === "ar" ? "ar" : "fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(startAt));
  } catch {
    return startAt.slice(0, 10);
  }
}

export function featuredEventSlides(events: EventCard[], locale: string): BannerSlide[] {
  return events
    .filter((event) => event.featured && !event.isFinished)
    .map((event) => ({
      eyebrow: formatEventEyebrow(event.startAt, locale),
      title: event.title,
      text: "",
      href: `/${locale}/evenements/${encodeURIComponent(event.id)}`,
      image: event.image || "/brand/intro-lecon.jpg",
      focus: "center 28%",
      fit: event.image?.includes("/events/") || event.image?.startsWith("http") ? "contain" : "cover",
    }));
}

export async function loadHomeEvents(locale: string): Promise<EventCard[]> {
  return loadEvents(locale);
}

type ApiTestimonial = {
  id: string;
  author_name?: string;
  relation?: string;
  content_i18n?: Record<string, string>;
};

export async function loadHomeTestimonials(locale: string): Promise<TestimonialCard[]> {
  const body = await serverApiFetch<{ data?: ApiTestimonial[] }>("/community/testimonials", {
    timeoutMs: 8000,
    revalidate: false,
    locale,
  });

  const rows = Array.isArray(body?.data) ? body.data : [];
  return rows.map((row) => {
    const content =
      row.content_i18n?.[locale] ||
      row.content_i18n?.fr ||
      Object.values(row.content_i18n || {})[0] ||
      "";
    return {
      id: row.id,
      author: row.author_name || "",
      relation: row.relation || "member",
      content,
    };
  });
}

type ApiPartner = {
  id: string;
  name?: string;
  logo_url?: string | null;
  website_url?: string | null;
};

export async function loadHomePartners(): Promise<PartnerLogo[]> {
  const body = await serverApiFetch<{ data?: ApiPartner[] }>("/community/partners", {
    timeoutMs: 8000,
    revalidate: false,
  });

  const rows = Array.isArray(body?.data) ? body.data : [];
  return rows
    .filter((row) => Boolean(row.logo_url))
    .map((row) => ({
      id: row.id,
      name: row.name || "Partenaire",
      logoUrl: row.logo_url as string,
      websiteUrl: row.website_url || null,
    }));
}
