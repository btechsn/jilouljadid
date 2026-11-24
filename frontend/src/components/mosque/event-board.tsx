"use client";

import Image from "next/image";

import { isRemoteUpload } from "@/lib/media";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { EightPointStar } from "@/components/brand/ornaments";
import { cn } from "@/lib/utils";

export type EventCard = {
  id: string;
  title: string;
  description: string;
  /** Texte long de la fiche détail (page dédiée). */
  body?: string;
  type: string;
  startAt: string;
  location: string;
  image: string;
  isFinished: boolean;
  canRegister: boolean;
  youtubeUrl: string;
  gallery?: string[];
  featured?: boolean;
};

const FALLBACKS = [
  "/brand/slide-centre.jpg",
  "/brand/slide-priere.jpg",
  "/brand/slide-academique.jpg",
  "/brand/slide-actualites.jpg",
] as const;

const TYPE_KEYS = [
  "lecture",
  "conference",
  "special_prayer",
  "fundraising",
  "community",
  "gamou",
  "workshop",
  "other",
] as const;

const PER_PAGE = 5;

function bySoonest(a: EventCard, b: EventCard) {
  if (a.isFinished !== b.isFinished) return a.isFinished ? 1 : -1;
  const left = a.startAt || "";
  const right = b.startAt || "";
  return a.isFinished ? right.localeCompare(left) : left.localeCompare(right);
}

function formatWhen(iso: string, locale: string) {
  if (!iso?.trim()) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Dakar",
  }).format(date);
}

function EventListItem({
  item,
  imageFallback,
  locale,
  labelClass,
  typeLabel,
  learnMore,
  participate,
  badge,
  badgeTone,
}: {
  item: EventCard;
  imageFallback: string;
  locale: string;
  labelClass: string;
  typeLabel: (value: string) => string;
  learnMore: string;
  participate: string;
  badge: string;
  badgeTone: "upcoming" | "past";
}) {
  const href = `/${locale}/evenements/${item.id}`;

  return (
    <li className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <article className="grid h-full sm:grid-cols-[11rem_minmax(0,1fr)]">
        <Link href={href} className="relative min-h-40 sm:min-h-full">
          <Image
            src={item.image || imageFallback}
            alt=""
            fill
            sizes="(min-width: 64rem) 20vw, 40vw"
            className="object-cover object-top"
            unoptimized={isRemoteUpload(item.image || imageFallback)}
          />
          <span
            className={cn(
              "absolute start-3 top-3 inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide",
              badgeTone === "upcoming" ? "bg-gold-300 text-brand-950" : "bg-brand-900/80 text-white",
            )}
          >
            {badge}
          </span>
        </Link>
        <div className="flex flex-col p-5">
          <p className="nh-numeric text-small text-content-secondary">
            {[formatWhen(item.startAt, locale), item.location].filter(Boolean).join(" · ")}
          </p>
          {item.type ? <p className="mt-1 text-xs font-semibold text-primary">{typeLabel(item.type)}</p> : null}
          <h3 className={`mt-2 font-sans text-xl font-extrabold text-content ${locale === "ar" ? "font-arabic" : ""}`}>
            <Link href={href} className="hover:text-brand-800">
              {item.title}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-3 text-small text-content-secondary">{item.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={href} className={`nh-event-more inline-flex w-fit rounded-full px-5 py-2 text-xs font-semibold ${labelClass}`}>
              {learnMore}
            </Link>
            {!item.isFinished && item.canRegister ? (
              <Link
                href={`${href}?inscription=1`}
                className={`inline-flex w-fit rounded-full border border-primary px-5 py-2 text-xs font-semibold text-primary ${labelClass}`}
              >
                {participate}
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    </li>
  );
}

function EventSection({
  title,
  countLabel,
  items,
  locale,
  labelClass,
  typeLabel,
  learnMore,
  participate,
  badge,
  badgeTone,
  badgeForItem,
}: {
  title: string;
  countLabel: string;
  items: EventCard[];
  locale: string;
  labelClass: string;
  typeLabel: (value: string) => string;
  learnMore: string;
  participate: string;
  badge?: string;
  badgeTone?: "upcoming" | "past";
  badgeForItem?: (item: EventCard) => { label: string; tone: "upcoming" | "past" };
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="font-sans text-lg font-extrabold text-content">{title}</h2>
        <span className="text-xs font-semibold uppercase tracking-wide text-content-secondary">{countLabel}</span>
      </div>
      <ul className="space-y-4">
        {items.map((item, index) => {
          const resolved = badgeForItem?.(item);
          return (
            <EventListItem
              key={item.id}
              item={item}
              imageFallback={FALLBACKS[index % FALLBACKS.length]}
              locale={locale}
              labelClass={labelClass}
              typeLabel={typeLabel}
              learnMore={learnMore}
              participate={participate}
              badge={resolved?.label ?? badge ?? ""}
              badgeTone={resolved?.tone ?? badgeTone ?? "upcoming"}
            />
          );
        })}
      </ul>
    </section>
  );
}

export function EventBoard({ items: initialItems = [] }: { items?: EventCard[] }) {
  const locale = useLocale();
  const t = useTranslations("pages.events");
  const common = useTranslations("common");
  const [items, setItems] = useState<EventCard[]>(initialItems);
  const [loading, setLoading] = useState(initialItems.length === 0);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(0);
  const [groupBy, setGroupBy] = useState<"status" | "type">("status");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { fetchEventsClient } = await import("@/lib/events-api");
        const live = await fetchEventsClient(locale);
        // Toujours remplacer par le BO local dès que l’API répond (même si liste vide).
        if (!cancelled && live !== null) {
          setItems(live);
        }
      } catch {
        /* garde initialItems */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const typesInData = useMemo(
    () => [...new Set(items.map((item) => item.type).filter(Boolean))],
    [items],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    return [...items]
      .sort((a, b) => {
        if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
        return bySoonest(a, b);
      })
      .filter((item) => {
      const day = item.startAt.slice(0, 10);
      if (from && day && day < from) return false;
      if (to && day && day > to) return false;
      if (type && item.type !== type) return false;
      if (!needle) return true;
      const haystack = `${item.title} ${item.description} ${item.location}`.toLocaleLowerCase(locale);
      return haystack.includes(needle);
    });
  }, [items, query, from, to, type, locale]);

  const upcoming = useMemo(() => filtered.filter((item) => !item.isFinished), [filtered]);
  const past = useMemo(() => filtered.filter((item) => item.isFinished), [filtered]);

  const byTypeGroups = useMemo(() => {
    const order = TYPE_KEYS.filter((key) => filtered.some((item) => item.type === key));
    const extras = [...new Set(filtered.map((item) => item.type).filter((value) => value && !TYPE_KEYS.includes(value as (typeof TYPE_KEYS)[number])))];
    return [...order, ...extras].map((key) => ({
      key,
      items: filtered.filter((item) => item.type === key).sort(bySoonest),
    }));
  }, [filtered]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const visible = filtered.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const splitMode = filtered.length <= PER_PAGE;

  useEffect(() => {
    setPage(0);
  }, [query, from, to, type, groupBy]);

  const clearFilters = () => {
    setDraft("");
    setQuery("");
    setFrom("");
    setTo("");
    setType("");
    setPage(0);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setQuery(draft.trim());
  };

  const labelClass = locale === "ar" ? "font-arabic" : "uppercase tracking-wide";
  const hasFilters = Boolean(query || from || to || type);

  const typeLabel = (value: string) => {
    if (!value) return "";
    return TYPE_KEYS.includes(value as (typeof TYPE_KEYS)[number]) ? t(`types.${value}`) : value;
  };

  if (items.length === 0) {
    return <p className="mt-10 text-content-secondary">{t("empty")}</p>;
  }

  return (
    <>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 order-2 lg:order-1">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-content">{t("groupBy")}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setGroupBy("status")}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition",
                  groupBy === "status"
                    ? "bg-brand-900 text-white"
                    : "bg-white text-content ring-1 ring-black/10 hover:bg-brand-50",
                )}
              >
                {t("groupByStatus")}
              </button>
              <button
                type="button"
                onClick={() => setGroupBy("type")}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition",
                  groupBy === "type"
                    ? "bg-brand-900 text-white"
                    : "bg-white text-content ring-1 ring-black/10 hover:bg-brand-50",
                )}
              >
                {t("groupByType")}
              </button>
            </div>
          </div>

          {loading && items.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-content-secondary shadow-sm ring-1 ring-black/5">
              …
            </p>
          ) : filtered.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-content-secondary shadow-sm ring-1 ring-black/5">
              {query || type || from || to ? t("noMatch") : t("empty")}
            </p>
          ) : groupBy === "type" ? (
            <div className="space-y-10">
              {byTypeGroups.map((group) => (
                <EventSection
                  key={group.key}
                  title={typeLabel(group.key)}
                  countLabel={t("resultsCount", { count: group.items.length })}
                  items={group.items}
                  locale={locale}
                  labelClass={labelClass}
                  typeLabel={typeLabel}
                  learnMore={t("learnMore")}
                  participate={t("participate")}
                  badgeForItem={(item) =>
                    item.isFinished
                      ? { label: t("badgePast"), tone: "past" }
                      : { label: t("badgeUpcoming"), tone: "upcoming" }
                  }
                />
              ))}
            </div>
          ) : splitMode ? (
            <div className="space-y-10">
              {upcoming.length > 0 ? (
                <EventSection
                  title={t("listTitle")}
                  countLabel={t("resultsCount", { count: upcoming.length })}
                  items={upcoming}
                  locale={locale}
                  labelClass={labelClass}
                  typeLabel={typeLabel}
                  learnMore={t("learnMore")}
                  participate={t("participate")}
                  badge={t("badgeUpcoming")}
                  badgeTone="upcoming"
                />
              ) : null}
              {past.length > 0 ? (
                <EventSection
                  title={t("pastTitle")}
                  countLabel={t("resultsCount", { count: past.length })}
                  items={past}
                  locale={locale}
                  labelClass={labelClass}
                  typeLabel={typeLabel}
                  learnMore={t("learnMore")}
                  participate={t("participate")}
                  badge={t("badgePast")}
                  badgeTone="past"
                />
              ) : null}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="font-sans text-lg font-extrabold text-content">{t("listTitle")}</h2>
                <span className="text-xs font-semibold uppercase tracking-wide text-content-secondary">
                  {t("resultsCount", { count: filtered.length })}
                </span>
              </div>
              <ul className="space-y-4">
                {visible.map((item, index) => (
                  <EventListItem
                    key={item.id}
                    item={item}
                    imageFallback={FALLBACKS[(safePage * PER_PAGE + index) % FALLBACKS.length]}
                    locale={locale}
                    labelClass={labelClass}
                    typeLabel={typeLabel}
                    learnMore={t("learnMore")}
                    participate={t("participate")}
                    badge={item.isFinished ? t("badgePast") : t("badgeUpcoming")}
                    badgeTone={item.isFinished ? "past" : "upcoming"}
                  />
                ))}
              </ul>
              {pages > 1 ? (
                <nav
                  aria-label={t("pageOf", { page: safePage + 1, pages })}
                  className="mt-6 flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(0, safePage - 1))}
                    disabled={safePage === 0}
                    className="nh-khutba-arrow disabled:opacity-40"
                    aria-label={common("previous")}
                  >
                    ‹
                  </button>
                  <p className="nh-numeric text-small text-content-secondary">
                    {t("pageOf", { page: safePage + 1, pages })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(pages - 1, safePage + 1))}
                    disabled={safePage >= pages - 1}
                    className="nh-khutba-arrow disabled:opacity-40"
                    aria-label={common("next")}
                  >
                    ›
                  </button>
                </nav>
              ) : null}
            </>
          )}
        </div>

        <aside className="order-1 h-fit space-y-5 lg:sticky lg:top-24 lg:order-2">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-sans text-base font-extrabold text-content">{t("searchTitle")}</h3>
              <EightPointStar size={14} className="text-gold-500" />
            </div>
            <form onSubmit={submitSearch} className="mt-4 space-y-3">
              <input
                type="search"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t("search")}
                aria-label={t("search")}
                className="h-11 w-full rounded-xl border-0 bg-[#f3f4f6] px-4 text-sm text-content outline-none ring-1 ring-transparent focus:bg-white focus:ring-2 focus:ring-gold-300/60"
              />
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-700 px-4 text-xs font-semibold uppercase tracking-wide text-white hover:bg-brand-800"
              >
                {t("searchSubmit")}
              </button>
            </form>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h3 className="font-sans text-base font-extrabold text-content">{t("filterTitle")}</h3>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-content">{t("type")}</p>
              <FilterChip active={!type} label={t("allTypes")} onClick={() => setType("")} />
              {typesInData.map((value) => (
                <FilterChip
                  key={value}
                  active={type === value}
                  label={typeLabel(value)}
                  onClick={() => setType(value)}
                />
              ))}
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-sm font-semibold text-content">{t("dateRange")}</p>
              <label className="block">
                <span className="text-xs text-content-secondary">{t("from")}</span>
                <input
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  aria-label={t("from")}
                  className="mt-1.5 h-11 w-full rounded-xl border-0 bg-[#f3f4f6] px-3 text-sm text-content outline-none focus:bg-white focus:ring-2 focus:ring-gold-300/60"
                />
              </label>
              <label className="block">
                <span className="text-xs text-content-secondary">{t("to")}</span>
                <input
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  aria-label={t("to")}
                  className="mt-1.5 h-11 w-full rounded-xl border-0 bg-[#f3f4f6] px-3 text-sm text-content outline-none focus:bg-white focus:ring-2 focus:ring-gold-300/60"
                />
              </label>
            </div>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-primary hover:underline"
              >
                {t("clearFilters")}
              </button>
            ) : null}
          </section>
        </aside>
      </div>
    </>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl px-3 py-2.5 text-start text-sm font-medium transition",
        active ? "bg-brand-700 text-white" : "bg-[#f3f4f6] text-content hover:bg-brand-50",
      )}
    >
      {label}
    </button>
  );
}
