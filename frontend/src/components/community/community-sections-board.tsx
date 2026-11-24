"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { EightPointStar } from "@/components/brand/ornaments";
import { useAuth } from "@/hooks/useAuth";
import {
  isExternalDonateHref,
  paypalDonateHref,
  stripeDonateHref,
  walletDonateHref,
} from "@/lib/donation-links";
import { toPublicMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

const COMMUNITY_HERO_FALLBACK = "/brand/intro-lecon.jpg";

export type CommunitySection = {
  id: string;
  name: string;
  description: string;
  members: number;
  tag?: string;
};

type MembershipStatus = "none" | "pending" | "member";

const STORAGE_KEY = "jj-section-membership";

const TAG_TONES = [
  "bg-brand-50 text-brand-800",
  "bg-gold-100 text-brand-900",
  "bg-[#eef6f2] text-brand-800",
  "bg-[#f5f0e6] text-brand-900",
  "bg-[#e8f0fe] text-brand-900",
];

/** Sections du mouvement (contenu local tant que l’API sections n’est pas branchée). */
const LOCAL_SECTIONS: Record<"fr" | "en" | "ar", CommunitySection[]> = {
  fr: [
    {
      id: "jeunesse",
      name: "Jeunesse & fraternité",
      description: "Se connaître, se rapprocher et renforcer l’appartenance à la grande fraternité islamique.",
      members: 42,
      tag: "Section",
    },
    {
      id: "transmission",
      name: "Transmission",
      description: "Préserver le patrimoine et la voie du Cheikh, par la sagesse et la bonne exhortation.",
      members: 28,
      tag: "Section",
    },
    {
      id: "service",
      name: "Service",
      description: "Œuvrer concrètement pour le bien : entraide, présence et engagement auprès des nouvelles générations.",
      members: 35,
      tag: "Section",
    },
    {
      id: "unite",
      name: "Unité de la Fayda",
      description: "Refuser les divisions, rapprocher les rangs et avancer ensemble.",
      members: 31,
      tag: "Section",
    },
  ],
  en: [
    {
      id: "jeunesse",
      name: "Youth & brotherhood",
      description: "To foster mutual knowledge and belonging to the great Islamic brotherhood.",
      members: 42,
      tag: "Section",
    },
    {
      id: "transmission",
      name: "Transmission",
      description: "To preserve the heritage and the Shaykh’s path through wisdom and good counsel.",
      members: 28,
      tag: "Section",
    },
    {
      id: "service",
      name: "Service",
      description: "Concrete work for the good: mutual aid, presence and commitment with new generations.",
      members: 35,
      tag: "Section",
    },
    {
      id: "unite",
      name: "Unity of the Fayda",
      description: "To refuse divisions, join the ranks and walk forward together.",
      members: 31,
      tag: "Section",
    },
  ],
  ar: [
    {
      id: "jeunesse",
      name: "الشباب والأخوة",
      description: "تعزيز التعارف والانتماء إلى الأخوة الإسلامية الكبرى.",
      members: 42,
      tag: "قسم",
    },
    {
      id: "transmission",
      name: "التبليغ",
      description: "حفظ التراث وطريق الشيخ بالحكمة والموعظة الحسنة.",
      members: 28,
      tag: "قسم",
    },
    {
      id: "service",
      name: "الخدمة",
      description: "العمل للخير: التكافل والحضور مع الأجيال الجديدة.",
      members: 35,
      tag: "قسم",
    },
    {
      id: "unite",
      name: "وحدة الفيضة",
      description: "رفض الفرقة وتوحيد الصفوف والمضي معاً.",
      members: 31,
      tag: "قسم",
    },
  ],
};

function readMembership(): Record<string, MembershipStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, MembershipStatus>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMembership(map: Record<string, MembershipStatus>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function CommunitySectionsBoard() {
  const locale = useLocale();
  const lang = locale === "en" || locale === "ar" ? locale : "fr";
  const t = useTranslations("community");
  const pages = useTranslations("pages.community");
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [joinSection, setJoinSection] = useState<CommunitySection | null>(null);
  const [membership, setMembership] = useState<Record<string, MembershipStatus>>({});
  const [heroImage, setHeroImage] = useState(COMMUNITY_HERO_FALLBACK);

  useEffect(() => {
    setMembership(readMembership());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { loadSiteSettings } = await import("@/lib/site-settings");
        const settings = await loadSiteSettings();
        if (cancelled) return;
        setHeroImage(toPublicMediaUrl(settings.communityImageUrl, COMMUNITY_HERO_FALLBACK));
      } catch {
        /* garde le fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sections = useMemo(() => {
    const list = LOCAL_SECTIONS[lang];
    const needle = query.trim().toLocaleLowerCase(locale);
    if (!needle) return list;
    return list.filter((section) => {
      const haystack = `${section.name} ${section.description}`.toLocaleLowerCase(locale);
      return haystack.includes(needle);
    });
  }, [lang, locale, query]);

  const setStatus = (sectionId: string, status: MembershipStatus) => {
    setMembership((prev) => {
      const next = { ...prev, [sectionId]: status };
      writeMembership(next);
      return next;
    });
  };

  const statusOf = (id: string): MembershipStatus => membership[id] ?? "none";

  return (
    <article>
      <section className="relative isolate overflow-hidden bg-brand-950 text-white">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          unoptimized={heroImage.startsWith("/storage/") || /^https?:\/\//i.test(heroImage)}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-brand-900/80" />
        <div className="nh-container relative py-16 text-center sm:py-20">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold-300">
            <EightPointStar size={12} />
            {pages("eyebrow")}
          </p>
          <h1 className="mt-3 font-sans text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {pages("title")}
          </h1>
          <span aria-hidden="true" className="mx-auto mt-3 block h-0.5 w-16 bg-gold-300" />
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            {pages("lede")}
          </p>
        </div>
      </section>

      <div className="bg-[#f3f4f6]">
        <div className="nh-container py-10 sm:py-12">
          <section className="mb-8 overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{pages("donateEyebrow")}</p>
            <h2 className="mt-2 font-sans text-2xl font-extrabold text-content">{pages("donateTitle")}</h2>
            <p className="mt-2 max-w-2xl text-sm text-content-secondary">{pages("donateLede")}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <DonateLink
                href={stripeDonateHref(locale)}
                label={t("donateStripe")}
                tone="brand"
              />
              <DonateLink
                href={paypalDonateHref(locale)}
                label={t("donatePaypal")}
                tone="brand"
              />
              <DonateLink
                href={walletDonateHref(locale)}
                label={t("donateWallet")}
                tone="gold"
              />
              <Link
                href={`/${locale}/soutien`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-brand-900/15 px-5 text-xs font-semibold uppercase tracking-wide text-brand-900 hover:bg-brand-50"
              >
                {t("donateMore")}
              </Link>
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <div className="min-w-0 space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="font-sans text-lg font-extrabold text-content">{pages("sectionsTitle")}</h2>
                <label className="block w-full sm:max-w-xs">
                  <span className="sr-only">{t("search")}</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="h-11 w-full rounded-full border-0 bg-white px-4 text-sm text-content shadow-sm ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-gold-300/60"
                  />
                </label>
              </div>

              {sections.length ? (
                <ul className="space-y-3">
                  {sections.map((section, index) => {
                    const status = statusOf(section.id);
                    return (
                      <li
                        key={section.id}
                        className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-center"
                      >
                        <span
                          className={cn(
                            "inline-flex size-16 shrink-0 items-center justify-center rounded-xl",
                            TAG_TONES[index % TAG_TONES.length],
                          )}
                        >
                          <EightPointStar size={22} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-sans text-base font-extrabold text-content">{section.name}</h3>
                            {status === "pending" ? (
                              <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-brand-900">
                                {t("statusPending")}
                              </span>
                            ) : null}
                            {status === "member" ? (
                              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-brand-800">
                                {t("statusMember")}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-content-secondary line-clamp-2">{section.description}</p>
                          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-content-secondary">
                            <span className="inline-flex items-center gap-1.5">
                              <PeopleIcon />
                              {t("members", { count: section.members })}
                            </span>
                            {section.tag ? <span>{section.tag}</span> : null}
                          </p>
                        </div>
                        <SectionAction
                          status={status}
                          loggedIn={!!user}
                          locale={locale}
                          onJoin={() => setJoinSection(section)}
                          labels={{
                            join: t("joinGroup"),
                            pending: t("statusPending"),
                            chat: t("chat"),
                            loginToChat: t("loginToChat"),
                          }}
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-2xl bg-white p-6 text-sm text-content-secondary">
                  {query.trim() ? t("noMatch") : t("emptySections")}
                </p>
              )}
            </div>

            <aside className="h-fit space-y-5 lg:sticky lg:top-24">
              <section className="overflow-hidden rounded-2xl bg-brand-800 p-5 text-white shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-300">{pages("sidebarEyebrow")}</p>
                <h2 className="mt-2 font-sans text-lg font-extrabold leading-snug text-white">{pages("sidebarTitle")}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/80">{pages("sidebarLede")}</p>
                <Link
                  href={user ? `/${locale}/communaute/discussions` : `/${locale}/compte/connexion`}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-gold-300 text-xs font-semibold uppercase tracking-wide text-brand-950 hover:bg-gold-200"
                >
                  {user ? t("openChat") : t("loginToChat")}
                </Link>
              </section>

              <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{pages("donateEyebrow")}</p>
                <h2 className="mt-2 font-sans text-base font-extrabold text-content">{pages("donateTitle")}</h2>
                <p className="mt-2 text-sm text-content-secondary">{pages("donateLede")}</p>
                <div className="mt-4 space-y-2">
                  <DonateLink href={stripeDonateHref(locale)} label={t("donateStripe")} tone="brand" full />
                  <DonateLink href={paypalDonateHref(locale)} label={t("donatePaypal")} tone="brand" full />
                  <DonateLink href={walletDonateHref(locale)} label={t("donateWallet")} tone="gold" full />
                </div>
              </section>

              <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="font-sans text-base font-extrabold text-content">{pages("aboutTitle")}</h2>
                <ul className="mt-4 space-y-2.5">
                  {(pages.raw("points") as string[]).map((point) => (
                    <li key={point} className="flex gap-2 text-sm text-content-secondary">
                      <EightPointStar size={12} className="mt-1 shrink-0 text-gold-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </div>

      {joinSection ? (
        <JoinSectionModal
          section={joinSection}
          onClose={() => setJoinSection(null)}
          onSuccess={() => {
            setStatus(joinSection.id, "pending");
          }}
        />
      ) : null}
    </article>
  );
}

function DonateLink({
  href,
  label,
  tone,
  full = false,
}: {
  href: string;
  label: string;
  tone: "brand" | "gold";
  full?: boolean;
}) {
  const locale = useLocale();
  const arabic = locale === "ar";
  const external = isExternalDonateHref(href);
  const className = cn(
    "inline-flex h-11 items-center justify-center rounded-full px-5 text-xs font-semibold transition",
    arabic ? "font-arabic tracking-normal" : "uppercase tracking-wide",
    full && "w-full",
    tone === "brand"
      ? "bg-brand-900 text-white hover:bg-brand-800"
      : "bg-gold-300 text-brand-950 hover:bg-gold-200",
  );

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={className}
    >
      {label}
    </a>
  );
}

function SectionAction({
  status,
  loggedIn,
  locale,
  onJoin,
  labels,
}: {
  status: MembershipStatus;
  loggedIn: boolean;
  locale: string;
  onJoin: () => void;
  labels: { join: string; pending: string; chat: string; loginToChat: string };
}) {
  if (status === "pending") {
    return (
      <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-gold-300 px-4 text-[11px] font-semibold uppercase tracking-wide text-brand-900">
        {labels.pending}
      </span>
    );
  }

  if (status === "member") {
    return (
      <Link
        href={loggedIn ? `/${locale}/communaute/discussions` : `/${locale}/compte/connexion`}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-gold-300 px-4 text-[11px] font-semibold uppercase tracking-wide text-brand-950 hover:bg-gold-200"
      >
        {loggedIn ? labels.chat : labels.loginToChat}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onJoin}
      className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-brand-700 px-4 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-brand-800"
    >
      {labels.join}
    </button>
  );
}

function JoinSectionModal({
  section,
  onClose,
  onSuccess,
}: {
  section: CommunitySection;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations("community.join");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setStatus("idle");
    try {
      // Demande locale en attendant l’API sections / secrétariat
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
        setStatus("error");
        return;
      }
      onSuccess();
      setStatus("ok");
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="section-join-title"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg" onClick={(event) => event.stopPropagation()}>
        <h3 id="section-join-title" className="font-sans text-xl font-extrabold text-content">
          {section.name}
        </h3>
        <p className="mt-1 text-sm text-content-secondary">{t("lede")}</p>

        {status === "ok" ? (
          <div className="mt-6">
            <p className="text-content">{t("success")}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-700 px-5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-brand-800"
            >
              {t("close")}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder={t("lastName")}
              aria-label={t("lastName")}
              className="w-full rounded-full border border-black/10 bg-[#f3f4f6] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-gold-300/50"
            />
            <input
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder={t("firstName")}
              aria-label={t("firstName")}
              className="w-full rounded-full border border-black/10 bg-[#f3f4f6] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-gold-300/50"
            />
            <input
              required
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t("phone")}
              aria-label={t("phone")}
              className="nh-numeric w-full rounded-full border border-black/10 bg-[#f3f4f6] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-gold-300/50"
            />
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t("message")}
              aria-label={t("message")}
              rows={3}
              className="w-full rounded-2xl border border-black/10 bg-[#f3f4f6] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-gold-300/50"
            />
            {status === "error" ? <p className="text-sm text-red-700">{t("error")}</p> : null}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-semibold text-content"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-gold-300 px-4 text-xs font-semibold uppercase tracking-wide text-brand-950 hover:bg-gold-200 disabled:opacity-60"
              >
                {busy ? t("loading") : t("submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden="true">
      <path d="M6 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm4.5-.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM2 13.5c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5V14H2v-.5Zm8.2-.5c.3-1.3 1.4-2.3 2.8-2.5.9.3 1.5 1.2 1.5 2.3V14h-4.3v-.5Z" />
    </svg>
  );
}
