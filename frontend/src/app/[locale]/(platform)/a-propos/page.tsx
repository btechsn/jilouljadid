import type { Metadata } from "next";

import { AboutView } from "@/components/movement/about-view";

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
  return <AboutView locale={locale} />;
}
