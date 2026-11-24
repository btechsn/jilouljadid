import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { EventDetail } from "@/components/mosque/event-detail";
import { loadEvent, loadEvents } from "@/lib/events-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  try {
    const events = await loadEvents("fr");
    return events.map((event) => ({ id: event.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const event = await loadEvent(locale, id);
  if (!event) {
    const t = await getTranslations({ locale, namespace: "pages.events" });
    return { title: t("title") };
  }
  return { title: event.title, description: event.description };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const event = await loadEvent(locale, id);
  const t = await getTranslations({ locale, namespace: "pages.events" });

  if (!event) {
    return (
      <div className="nh-container py-16">
        <div className="mx-auto max-w-xl rounded-2xl bg-red-50 p-8 text-center">
          <p className="text-red-800">{t("detailNotFound")}</p>
          <Link
            href={`/${locale}/evenements`}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-brand-700 hover:bg-brand-700 hover:text-white"
          >
            ← {t("detailBack")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <EventDetail event={event} />
    </Suspense>
  );
}
