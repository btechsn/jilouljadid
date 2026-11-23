import { JiloulPage } from "@/components/movement/jiloul-page";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <JiloulPage locale={locale} page="rejoindre" />;
}
