import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeading } from "@/components/layout/page-heading";
import { EventBoard } from "@/components/mosque/event-board";
import { jiloulEvents } from "@/lib/jiloul-events";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.events" });
  return { title: t("title") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("pages.events");
  const events = jiloulEvents(locale);

  return (
    <article>
      <PageHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={
          locale === "en"
            ? "The days, circles and gatherings announced by the movement."
            : locale === "ar"
              ? "الأيام والحلقات والمواعيد التي أعلنتها الحركة."
              : "Les journées, les cercles et les rendez-vous annoncés par le mouvement."
        }
        image="/brand/slide-centre.jpg"
      />
      <div className="bg-[#f3f4f6]">
        <div className="nh-container py-10 sm:py-12 pb-16">
          <EventBoard items={events} />
        </div>
      </div>
    </article>
  );
}
