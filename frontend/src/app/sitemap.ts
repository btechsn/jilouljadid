import type { MetadataRoute } from "next";

const LOCALES = ["fr", "en", "ar"] as const;

const PATHS = [
  "",
  "/a-propos",
  "/evenements",
  "/direct",
  "/communaute",
  "/mediatheque",
  "/contact",
  "/soutien",
  "/rejoindre",
  "/imam-day",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://jilouljadid.com";

  return PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${origin}/${locale}${path}`,
      alternates: {
        languages: {
          fr: `${origin}/fr${path}`,
          en: `${origin}/en${path}`,
          ar: `${origin}/ar${path}`,
        },
      },
    })),
  );
}
