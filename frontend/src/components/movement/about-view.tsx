import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { BannerSlider, type BannerSlide } from "@/components/layout/banner-slider";
import { LiveAnnouncementBar } from "@/components/layout/live-announcement-bar";
import { PartnersMarquee, type PartnerLogo } from "@/components/layout/partners-marquee";
import { TestimonialsCarousel, type TestimonialCard } from "@/components/layout/testimonials-carousel";
import { AboutShortcuts } from "@/components/movement/about-shortcuts";

type Locale = "fr" | "en" | "ar";

const FALLBACK_SLIDES: Record<
  Locale,
  { eyebrow: string; title: string; href: string; image?: string; focus?: string; fit?: "cover" | "contain" }[]
> = {
  fr: [
    { eyebrow: "Accueil", title: "La Nouvelle Génération", href: "#mouvement", image: "/brand/intro-lecon.jpg", focus: "center 78%" },
    { eyebrow: "Le programme", title: "Objectifs généraux", href: "#objectifs", image: "/brand/intro-lecon.jpg", focus: "center 75%" },
  ],
  en: [
    { eyebrow: "Home", title: "The New Generation", href: "#mouvement", image: "/brand/intro-lecon.jpg", focus: "center 78%" },
    { eyebrow: "The programme", title: "General aims", href: "#objectifs", image: "/brand/intro-lecon.jpg", focus: "center 75%" },
  ],
  ar: [
    { eyebrow: "الرئيسية", title: "الجيل الجديد", href: "#mouvement", image: "/brand/intro-lecon.jpg", focus: "center 78%" },
    { eyebrow: "البرنامج", title: "الأهداف العامة", href: "#objectifs", image: "/brand/intro-lecon.jpg", focus: "center 75%" },
  ],
};

const FALLBACK_VOICES: Record<Locale, TestimonialCard[]> = {
  fr: [
    { id: "aissatou", author: "Aïssatou Ndiaye", relation: "parent", content: "Le mouvement donne aux jeunes un cadre de fraternité et de bonnes valeurs." },
    { id: "moussa", author: "Moussa Fall", relation: "member", content: "Suivre la voie dans les paroles et dans les actes : c’est ce que j’ai trouvé ici." },
  ],
  en: [
    { id: "aissatou", author: "Aïssatou Ndiaye", relation: "parent", content: "The movement gives the young a setting of brotherhood and sound values." },
    { id: "moussa", author: "Moussa Fall", relation: "member", content: "To follow the path in words and in deeds: that is what I found here." },
  ],
  ar: [
    { id: "aissatou", author: "Aïssatou Ndiaye", relation: "parent", content: "تمنح الحركة الشباب إطار أخوة وقيم حسنة." },
    { id: "moussa", author: "Moussa Fall", relation: "member", content: "اتباع السبيل في الأقوال والأفعال: هذا ما وجدته هنا." },
  ],
};

const FALLBACK_PARTNERS: PartnerLogo[] = [
  { id: "imams", name: "Association des Imams du Sénégal", logoUrl: "/brand/slide-priere.jpg", websiteUrl: null },
  { id: "biblio", name: "Bibliothèque Islamique de Dakar", logoUrl: "/brand/slide-academique.jpg", websiteUrl: null },
  { id: "radio", name: "Radio Fréquence Islam", logoUrl: "/brand/slide-live.jpg", websiteUrl: null },
];

function hrefOf(locale: string, href: string) {
  if (href.startsWith("#") || href.startsWith(`/${locale}/`)) return href;
  return `/${locale}${href}`;
}

type Props = {
  locale: string;
  featuredSlides?: BannerSlide[];
  testimonials?: TestimonialCard[];
  partners?: PartnerLogo[];
  founderImageUrl?: string;
};

export async function AboutView({
  locale,
  featuredSlides = [],
  testimonials = [],
  partners = [],
  founderImageUrl = "",
}: Props) {
  const lang: Locale = locale === "en" || locale === "ar" ? locale : "fr";
  const arabic = lang === "ar";
  const t = await getTranslations("pages.accueil");

  const editorial: BannerSlide[] = FALLBACK_SLIDES[lang].map((slide) => ({
    ...slide,
    text: "",
    href: hrefOf(locale, slide.href),
    image: slide.image || "/brand/intro-lecon.jpg",
    focus: slide.focus || "center 35%",
    fit: slide.fit || "cover",
  }));

  const slides: BannerSlide[] =
    featuredSlides.length > 0 ? [...featuredSlides, ...editorial] : editorial;

  const voiceItems = testimonials.length > 0 ? testimonials : FALLBACK_VOICES[lang];
  const partnerItems = partners.length > 0 ? partners : FALLBACK_PARTNERS;

  const points = (() => {
    try {
      const raw = t.raw("points");
      return Array.isArray(raw) ? raw.map(String) : [];
    } catch {
      return [];
    }
  })();

  const aims = [1, 2, 3, 4].map((n) => ({
    title: t(`aim${n}Title` as "aim1Title"),
    text: t(`aim${n}Text` as "aim1Text"),
  }));

  return (
    <article>
      <div className="relative overflow-x-clip">
        <LiveAnnouncementBar />
        <BannerSlider slides={slides} />
        <AboutShortcuts locale={locale} />
      </div>

      <section id="mouvement" className="scroll-mt-24 nh-container grid items-center gap-8 py-16 lg:grid-cols-2">
        <div>
          <h2 className={`font-sans text-3xl font-extrabold tracking-tight text-primary sm:text-4xl ${arabic ? "font-arabic" : ""}`}>
            {t("introTitle")}
          </h2>
          <p className={`mt-4 text-content-secondary ${arabic ? "font-arabic" : ""}`}>{t("introLede")}</p>
          {points.length > 0 ? (
            <ul className={`mt-6 space-y-2 text-small text-content ${arabic ? "font-arabic" : ""}`}>
              {points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}
          <a
            href="#objectifs"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-small font-semibold text-on-primary transition hover:bg-primary-hover"
          >
            {t("introMore")}
          </a>
        </div>
        <div className="relative min-h-72 overflow-hidden rounded-lg">
          <Image src="/brand/intro-lecon.jpg" alt="" fill sizes="640px" className="object-cover object-center" />
        </div>
      </section>

      <section id="fondateur" className="scroll-mt-24 bg-[#f3f4f6] py-16">
        <div className="nh-container grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            <span aria-hidden="true" className="absolute -start-3 top-6 bottom-6 w-10 rounded-sm bg-primary sm:-start-5 sm:w-14" />
            <div className="relative overflow-hidden rounded-sm bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:p-4">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f7f3ea]">
                <Image
                  src={founderImageUrl.trim() || "/brand/seydina-aliou.jpg"}
                  alt={t("founderName")}
                  fill
                  unoptimized
                  sizes="(min-width: 64rem) 28vw, 80vw"
                  className="object-cover object-top bg-white"
                />
              </div>
            </div>
          </div>
          <div>
            <p className={`text-small font-semibold uppercase tracking-wide text-primary ${arabic ? "font-arabic" : ""}`}>
              {t("founderEyebrow")}
            </p>
            <h2 className={`mt-2 font-sans text-3xl font-extrabold text-content-accent sm:text-4xl ${arabic ? "font-arabic" : ""}`}>
              {t("founderTitle")}
            </h2>
            <div className={`mt-6 space-y-4 text-content ${arabic ? "font-arabic" : ""}`}>
              <p>{t("founderP1")}</p>
              <p>{t("founderP2")}</p>
              <p>{t("founderP3")}</p>
            </div>
            <p className={`mt-8 text-end text-xl text-content-accent ${arabic ? "font-arabic" : "italic"}`}>
              {t("founderName")}
            </p>
            <p className={`text-end text-small text-content-secondary ${arabic ? "font-arabic" : ""}`}>
              {t("founderLine")}
            </p>
          </div>
        </div>
      </section>

      <section id="objectifs" className="scroll-mt-24 bg-brand-900 py-14 text-white">
        <div className="nh-container">
          <h2 className={`text-center font-sans text-3xl font-extrabold text-white ${arabic ? "font-arabic" : ""}`}>
            {t("aimsTitle")}
          </h2>
          <p className={`mx-auto mt-3 max-w-2xl text-center text-small text-white/75 ${arabic ? "font-arabic" : ""}`}>
            {t("aimsLede")}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {aims.map((aim) => (
              <article key={aim.title} className="nh-mission-card nh-mission-card--light nh-mission-card--visible">
                <div className="nh-mission-card__inner flex h-full flex-col p-6 text-center">
                  <h3 className={`nh-mission-card__title font-sans text-lg font-bold ${arabic ? "font-arabic" : ""}`}>{aim.title}</h3>
                  <p className={`nh-mission-card__text mt-3 flex-1 text-small ${arabic ? "font-arabic" : ""}`}>{aim.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f4f6] py-14">
        <div className="nh-container">
          <h2 className={`text-center font-sans text-3xl font-extrabold text-primary ${arabic ? "font-arabic" : ""}`}>
            {t("testimonialsTitle")}
          </h2>
          <p className={`mx-auto mt-3 max-w-2xl text-center text-small text-content-secondary ${arabic ? "font-arabic" : ""}`}>
            {t("testimonialsLede")}
          </p>
          <TestimonialsCarousel items={voiceItems} />
        </div>
      </section>

      <section className="border-y border-primary/15 bg-primary/[0.06] py-12">
        <div className="nh-container">
          <h2 className={`text-center font-sans text-3xl font-extrabold text-primary ${arabic ? "font-arabic" : ""}`}>
            {t("partnersTitle")}
          </h2>
          <PartnersMarquee items={partnerItems} />
        </div>
      </section>
    </article>
  );
}
