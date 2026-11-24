export type LocalizedText = {
  fr: string;
  en: string;
  ar: string;
};

export type FooterLink = {
  href: string;
  label: LocalizedText;
};

export type SiteSettings = {
  address: string;
  city: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  footerNote: string;
  plausibleDomain: string;
  logoUrl: string;
  footerTitle: LocalizedText;
  footerBlurb: LocalizedText;
  usefulTitle: LocalizedText;
  otherTitle: LocalizedText;
  usefulLinks: FooterLink[];
  otherLinks: FooterLink[];
  newsletterEnabled: boolean;
  newsletterPlaceholder: LocalizedText;
  newsletterButton: LocalizedText;
  centreImageUrl: string;
  founderImageUrl: string;
  livePosterUrl: string;
  communityImageUrl: string;
  mediaImageUrl: string;
  contactImageUrl: string;
};

const USEFUL_LINKS: FooterLink[] = [
  { href: "/a-propos", label: { fr: "Accueil", en: "Home", ar: "الرئيسية" } },
  { href: "/evenements", label: { fr: "Événements", en: "Events", ar: "الفعاليات" } },
  { href: "/direct", label: { fr: "En direct", en: "Live", ar: "البث المباشر" } },
  { href: "/communaute", label: { fr: "Communauté", en: "Community", ar: "المجتمع" } },
  { href: "/mediatheque", label: { fr: "Médiathèque", en: "Media library", ar: "المكتبة الإعلامية" } },
  { href: "/contact", label: { fr: "Contact", en: "Contact", ar: "اتصل بنا" } },
];

const OTHER_LINKS: FooterLink[] = [
  { href: "/rejoindre", label: { fr: "Rejoindre", en: "Join", ar: "الانضمام" } },
  { href: "/soutien", label: { fr: "Faire un don", en: "Donate", ar: "تبرّع" } },
];

export const SITE_SETTINGS_FALLBACK: SiteSettings = {
  address: "Médina Baye",
  city: "Kaolack",
  phone: "+221 77 090 90 65",
  email: "contact@jilouljadid.com",
  latitude: 14.1676718,
  longitude: -16.0582136,
  footerNote: "",
  plausibleDomain: "",
  logoUrl: "",
  footerTitle: {
    fr: "Jiloul Jadid",
    en: "Jiloul Jadid",
    ar: "الجيل الجديد",
  },
  footerBlurb: {
    fr: "Mouvement de jeunesse fondé par Seydina Aliou Cissé, fils de l’Imam Cheikh Tidiane Cissé. Ensemble pour le bien.",
    en: "A youth movement founded by Seydina Aliou Cissé, son of Imam Cheikh Tidiane Cissé. Together for the good.",
    ar: "حركة شبابية أسسها سيدنا علي سيسي، نجل الإمام الشيخ تجاني سيسي. معاً من أجل الخير.",
  },
  usefulTitle: { fr: "Liens utiles", en: "Useful links", ar: "روابط مفيدة" },
  otherTitle: { fr: "Autres liens", en: "Other links", ar: "روابط أخرى" },
  usefulLinks: USEFUL_LINKS,
  otherLinks: OTHER_LINKS,
  newsletterEnabled: true,
  newsletterPlaceholder: { fr: "Votre e-mail", en: "Your email", ar: "بريدك" },
  newsletterButton: { fr: "S'abonner", en: "Subscribe", ar: "اشترك" },
  centreImageUrl: "",
  founderImageUrl: "",
  livePosterUrl: "",
  communityImageUrl: "",
  mediaImageUrl: "",
  contactImageUrl: "",
};

export function localized(text: LocalizedText, locale: string): string {
  if (locale === "en" || locale === "ar") {
    return text[locale] || text.fr;
  }

  return text.fr;
}

const PLACE_AR: Record<string, string> = {
  dakar: "دكار",
  "dakar, sénégal": "دكار، السنغال",
  "dakar, senegal": "دكار، السنغال",
};

export function localizedPlace(value: string, locale: string): string {
  if (locale !== "ar" || !value.trim()) return value;
  return PLACE_AR[value.trim().toLowerCase()] ?? value;
}

const EASTERN_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function localizedPhone(value: string, locale: string): string {
  if (locale !== "ar" || !value) return value;
  return value.replace(/\d/g, (digit) => EASTERN_DIGITS[Number(digit)] ?? digit);
}

export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function fullAddress(settings: SiteSettings): string {
  if (!settings.city || settings.address.toLowerCase().includes(settings.city.toLowerCase())) {
    return settings.address;
  }

  return `${settings.address}, ${settings.city}`;
}

export function mapsSearchUrl(settings: SiteSettings): string {
  return `https://www.google.com/maps/search/?api=1&query=${settings.latitude},${settings.longitude}`;
}

export function mapsDirectionsUrl(settings: SiteSettings): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${settings.latitude},${settings.longitude}`;
}

export async function loadSiteSettings(): Promise<SiteSettings> {
  const { serverApiFetch } = await import("@/lib/server-api");
  const body = await serverApiFetch("/settings/public", {
    timeoutMs: 5000,
    revalidate: 30,
  });

  return normalizeSiteSettings(body);
}

export function normalizeSiteSettings(body: unknown): SiteSettings {
  if (!body || typeof body !== "object") return SITE_SETTINGS_FALLBACK;

  const data = body as Record<string, unknown>;
  const latitude = Number(data.latitude);
  const longitude = Number(data.longitude);

  return {
    address: typeof data.address === "string" && data.address ? data.address : SITE_SETTINGS_FALLBACK.address,
    city: typeof data.city === "string" ? data.city : SITE_SETTINGS_FALLBACK.city,
    phone: typeof data.phone === "string" && data.phone ? data.phone : SITE_SETTINGS_FALLBACK.phone,
    email: typeof data.email === "string" && data.email ? data.email : SITE_SETTINGS_FALLBACK.email,
    latitude: Number.isFinite(latitude) ? latitude : SITE_SETTINGS_FALLBACK.latitude,
    longitude: Number.isFinite(longitude) ? longitude : SITE_SETTINGS_FALLBACK.longitude,
    footerNote: typeof data.footer_note === "string" ? data.footer_note : "",
    plausibleDomain:
      typeof data.plausible_domain === "string" &&
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(data.plausible_domain)
        ? data.plausible_domain
        : "",
    logoUrl: typeof data.logo_url === "string" ? data.logo_url : "",
    footerTitle: readLocalized(data.footer_title, SITE_SETTINGS_FALLBACK.footerTitle),
    footerBlurb: readLocalized(data.footer_blurb, SITE_SETTINGS_FALLBACK.footerBlurb),
    usefulTitle: readLocalized(data.footer_useful_title, SITE_SETTINGS_FALLBACK.usefulTitle),
    otherTitle: readLocalized(data.footer_other_title, SITE_SETTINGS_FALLBACK.otherTitle),
    usefulLinks: readLinks(data.footer_useful_links, SITE_SETTINGS_FALLBACK.usefulLinks),
    otherLinks: readLinks(data.footer_other_links, SITE_SETTINGS_FALLBACK.otherLinks),
    newsletterEnabled: data.newsletter_enabled !== false,
    newsletterPlaceholder: readLocalized(data.newsletter_placeholder, SITE_SETTINGS_FALLBACK.newsletterPlaceholder),
    newsletterButton: readLocalized(data.newsletter_button, SITE_SETTINGS_FALLBACK.newsletterButton),
    centreImageUrl: typeof data.centre_image_url === "string" ? data.centre_image_url : "",
    founderImageUrl: typeof data.founder_image_url === "string" ? data.founder_image_url : "",
    livePosterUrl: typeof data.live_poster_url === "string" ? data.live_poster_url : "",
    communityImageUrl: typeof data.community_image_url === "string" ? data.community_image_url : "",
    mediaImageUrl: typeof data.media_image_url === "string" ? data.media_image_url : "",
    contactImageUrl: typeof data.contact_image_url === "string" ? data.contact_image_url : "",
  };
}

function readLocalized(value: unknown, fallback: LocalizedText): LocalizedText {
  if (!value || typeof value !== "object") return fallback;
  const row = value as Record<string, unknown>;

  return {
    fr: typeof row.fr === "string" && row.fr ? row.fr : fallback.fr,
    en: typeof row.en === "string" && row.en ? row.en : fallback.en,
    ar: typeof row.ar === "string" && row.ar ? row.ar : fallback.ar,
  };
}

function readLinks(value: unknown, fallback: FooterLink[]): FooterLink[] {
  if (!Array.isArray(value)) return fallback;

  const links = value.flatMap((item): FooterLink[] => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const href = typeof row.href === "string" ? row.href.trim() : "";
    if (!href) return [];
    const label = readLocalized(row.label, { fr: href, en: href, ar: href });
    return [{ href, label }];
  });

  return links;
}
