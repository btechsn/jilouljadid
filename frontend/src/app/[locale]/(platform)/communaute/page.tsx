import type { Metadata } from "next";

import { CommunitySectionsBoard } from "@/components/community/community-sections-board";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "en" ? "Community" : locale === "ar" ? "المجتمع" : "Communauté";
  return { title };
}

export default function Page() {
  return <CommunitySectionsBoard />;
}
