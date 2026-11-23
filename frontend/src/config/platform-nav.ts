/**
 * Carte du site public.
 * Accueil · Événements · Communauté · Médiathèque · Contact
 */
export const PLATFORM_NAV = [
  {
    id: "about",
    href: "/a-propos",
    items: [{ href: "/a-propos", key: "about" }],
  },
  {
    id: "events",
    href: "/evenements",
    items: [
      { href: "/evenements", key: "eventsPage" },
      { href: "/direct", key: "live" },
    ],
  },
  {
    id: "community",
    href: "/communaute",
    items: [{ href: "/communaute", key: "community" }],
  },
  {
    id: "media",
    href: "/mediatheque",
    items: [{ href: "/mediatheque", key: "media" }],
  },
  {
    id: "contact",
    href: "/contact",
    items: [{ href: "/contact", key: "contact" }],
  },
] as const;

export type PlatformGroup = (typeof PLATFORM_NAV)[number];
