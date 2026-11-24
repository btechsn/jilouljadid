import type { Metadata } from "next";

import { AboutView } from "@/components/movement/about-view";
import {
  featuredEventSlides,
  loadHomeEvents,
  loadHomePartners,
  loadHomeTestimonials,
} from "@/lib/home-api";
import { loadSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "en" ? "Home" : locale === "ar" ? "الرئيسية" : "Accueil";
  return { title };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [events, testimonials, partners, settings] = await Promise.all([
    loadHomeEvents(locale),
    loadHomeTestimonials(locale),
    loadHomePartners(),
    loadSiteSettings(),
  ]);

  const featuredSlides = featuredEventSlides(events, locale);

  return (
    <AboutView
      locale={locale}
      featuredSlides={featuredSlides}
      testimonials={testimonials}
      partners={partners}
      founderImageUrl={settings.founderImageUrl}
    />
  );
}
