import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { SupportBoard } from "@/components/community/support-board";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.support" });
  return { title: t("title") };
}

export default function SupportPage() {
  return (
    <Suspense fallback={null}>
      <SupportBoard />
    </Suspense>
  );
}
