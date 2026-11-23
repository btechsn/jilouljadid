import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

/**
 * Chemins publics Jiloul Jadid.
 */
export const routing = defineRouting({
  locales: ["fr", "en", "ar"],
  defaultLocale: "fr",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/contact": {
      fr: "/contact",
      en: "/contact",
      ar: "/اتصل-بنا",
    },
    "/evenements": "/evenements",
    "/evenements/[id]": "/evenements/[id]",
    "/direct": "/direct",
    "/direct/replay": "/direct/replay",
    "/direct/replay/[slug]": "/direct/replay/[slug]",
    "/direct/[id]": "/direct/[id]",
    "/communaute": "/communaute",
    "/communaute/discussions": "/communaute/discussions",
    "/communaute/[id]": "/communaute/[id]",
    "/soutien": "/soutien",
    "/compte/connexion": "/compte/connexion",
    "/compte/inscription": "/compte/inscription",
    "/compte/mot-de-passe-oublie": "/compte/mot-de-passe-oublie",
    "/reinitialiser": "/reinitialiser",
    "/compte/tableau-de-bord": "/compte/tableau-de-bord",
  },
});

export type Locale = (typeof routing.locales)[number];

/** Direction d'écriture par langue. Seul l'arabe est en RTL. */
export const LOCALE_DIRECTION: Record<Locale, "ltr" | "rtl"> = {
  fr: "ltr",
  en: "ltr",
  ar: "rtl",
};

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
