"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { EightPointStar } from "@/components/brand/ornaments";
import { PageHeading } from "@/components/layout/page-heading";
import { useMediaGallery, type GalleryMediaItem } from "@/hooks/useMediaGallery";
import { toPublicMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

const PER_PAGE = 48;
const MEDIA_HERO_FALLBACK = "/brand/slide-actualites.jpg";

/** Photos locales du mouvement quand l’API galerie est vide. */
const LOCAL_MEDIA: GalleryMediaItem[] = [
  {
    id: "local-imam-day-1",
    kind: "photo",
    caption: "Imam Day",
    event_name: "Imam Day",
    media_url: "/events/imam-day.jpg",
  },
  {
    id: "local-ansaroudine-1",
    kind: "photo",
    caption: "Journée Ansaroudine",
    event_name: "Journée Ansaroudine",
    media_url: "/events/ansaroudine-1.jpg",
  },
  {
    id: "local-ansaroudine-2",
    kind: "photo",
    caption: "Journée Ansaroudine",
    event_name: "Journée Ansaroudine",
    media_url: "/events/ansaroudine-2.jpg",
  },
  {
    id: "local-ansaroudine-3",
    kind: "photo",
    caption: "Journée Ansaroudine",
    event_name: "Journée Ansaroudine",
    media_url: "/events/ansaroudine-3.jpg",
  },
  {
    id: "local-guediawaye-1",
    kind: "photo",
    caption: "Prière et hadara",
    event_name: "Prière et hadara du vendredi",
    media_url: "/events/guediawaye-1.jpg",
  },
  {
    id: "local-guediawaye-2",
    kind: "photo",
    caption: "Prière et hadara",
    event_name: "Prière et hadara du vendredi",
    media_url: "/events/guediawaye-2.jpg",
  },
  {
    id: "local-guediawaye-3",
    kind: "photo",
    caption: "Prière et hadara",
    event_name: "Prière et hadara du vendredi",
    media_url: "/events/guediawaye-3.jpg",
  },
];

type EventGroup = {
  key: string;
  title: string;
  items: GalleryMediaItem[];
};

function youtubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "") || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url);
}

function groupByEvent(items: GalleryMediaItem[], untitled: string): EventGroup[] {
  const map = new Map<string, EventGroup>();
  for (const item of items) {
    const title = item.event_name?.trim() || untitled;
    const key = title.toLocaleLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      map.set(key, { key, title, items: [item] });
    }
  }
  return [...map.values()];
}

export function MediaBoard() {
  const locale = useLocale();
  const t = useTranslations("media");
  const pages = useTranslations("pages.media");
  const [kind, setKind] = useState<"" | "photo" | "video">("");
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [slideScope, setSlideScope] = useState<GalleryMediaItem[]>([]);
  const [heroImage, setHeroImage] = useState(MEDIA_HERO_FALLBACK);

  const { data: apiData, isLoading, meta } = useMediaGallery({
    kind: kind || undefined,
    q: q || undefined,
    page,
    perPage: PER_PAGE,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { loadSiteSettings } = await import("@/lib/site-settings");
        const settings = await loadSiteSettings();
        if (cancelled) return;
        setHeroImage(toPublicMediaUrl(settings.mediaImageUrl, MEDIA_HERO_FALLBACK));
      } catch {
        /* garde le fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo(() => {
    if (apiData.length > 0) return apiData;
    const needle = q.trim().toLocaleLowerCase(locale);
    return LOCAL_MEDIA.filter((item) => {
      if (kind && item.kind !== kind) return false;
      if (!needle) return true;
      const hay = `${item.caption} ${item.event_name || ""}`.toLocaleLowerCase(locale);
      return hay.includes(needle);
    });
  }, [apiData, kind, q, locale]);

  const groups = useMemo(() => groupByEvent(data, t("untitledEvent")), [data, t]);
  const totalPages = Math.max(1, meta?.last_page ?? 1);

  useEffect(() => {
    setPage(1);
  }, [kind, q]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const filters = useMemo(
    () =>
      [
        { id: "" as const, label: t("filters.all") },
        { id: "photo" as const, label: t("filters.photo") },
        { id: "video" as const, label: t("filters.video") },
      ] as const,
    [t],
  );

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setQ(draft.trim());
  };

  const openItem = (item: GalleryMediaItem, scope: GalleryMediaItem[]) => {
    setSlideScope(scope);
    setActiveId(item.id);
  };

  const activeIndex = slideScope.findIndex((item) => item.id === activeId);
  const active = activeIndex >= 0 ? slideScope[activeIndex] : null;

  return (
    <article>
      <PageHeading
        eyebrow={pages("eyebrow")}
        title={pages("title")}
        lede={pages("lede")}
        image={heroImage}
      />

      <section className="bg-[#f3f4f6]">
        <div className="nh-container py-10 sm:py-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id || "all"}
                  type="button"
                  onClick={() => setKind(filter.id)}
                  className={cn(
                    "inline-flex h-10 items-center rounded-full px-4 text-xs font-semibold uppercase tracking-wide transition",
                    kind === filter.id
                      ? "bg-brand-800 text-white"
                      : "bg-white text-brand-800 ring-1 ring-black/5 hover:bg-brand-50",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <form onSubmit={submitSearch} className="flex w-full gap-2 lg:max-w-md">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={pages("searchPlaceholder")}
                aria-label={t("search")}
                className="h-11 w-full rounded-full border-0 bg-white px-4 text-sm text-content shadow-sm ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-gold-300/60"
              />
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-gold-300 px-5 text-xs font-semibold uppercase tracking-wide text-brand-950 hover:bg-gold-200"
              >
                {t("search")}
              </button>
            </form>
          </div>

          {isLoading ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="aspect-[4/3] animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <p className="mt-8 rounded-2xl bg-white p-6 text-sm text-content-secondary">
              {q || kind ? pages("noMatch") : pages("empty")}
            </p>
          ) : (
            <>
              <div className="mt-10 space-y-12">
                {groups.map((group) => (
                  <section key={group.key} aria-labelledby={`event-${group.key}`}>
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold-600">
                          <EightPointStar size={12} />
                          {t("eventGroup")}
                        </p>
                        <h2
                          id={`event-${group.key}`}
                          className="mt-1 font-sans text-xl font-extrabold text-content sm:text-2xl"
                        >
                          {group.title}
                        </h2>
                      </div>
                      <p className="text-sm text-content-secondary">
                        {t("itemsCount", { count: group.items.length })}
                      </p>
                    </div>
                    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {group.items.map((item) => {
                        const cover = item.thumbnail_url || item.media_url;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => openItem(item, group.items)}
                              className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-start shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <span className="relative block aspect-[4/3] w-full overflow-hidden bg-[#eef1f4]">
                                {cover.startsWith("/") || cover.startsWith("http") ? (
                                  <Image
                                    src={cover}
                                    alt={item.caption || item.event_name || ""}
                                    fill
                                    sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 45vw, 100vw"
                                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                                    unoptimized={cover.startsWith("http")}
                                  />
                                ) : null}
                                <span
                                  className={cn(
                                    "absolute start-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                                    item.kind === "video"
                                      ? "bg-brand-900 text-white"
                                      : "bg-gold-300 text-brand-950",
                                  )}
                                >
                                  {item.kind === "video" ? t("filters.video") : t("filters.photo")}
                                </span>
                                {item.kind === "video" ? (
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand-950/70 text-white">
                                      <PlayIcon />
                                    </span>
                                  </span>
                                ) : null}
                              </span>
                              <span className="flex flex-1 flex-col gap-1 px-4 py-3">
                                {item.caption ? (
                                  <span className="line-clamp-2 text-sm font-semibold text-content">
                                    {item.caption}
                                  </span>
                                ) : (
                                  <span className="text-sm font-semibold text-content">
                                    {item.kind === "video" ? t("filters.video") : t("filters.photo")}
                                  </span>
                                )}
                                {item.taken_on ? (
                                  <span className="mt-auto pt-1 text-[11px] text-content-secondary">
                                    {formatDate(item.taken_on, locale)}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>

              {totalPages > 1 ? (
                <nav
                  aria-label={t("pageOf", { page, pages: totalPages })}
                  className="mt-8 flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="nh-khutba-arrow disabled:opacity-40"
                    aria-label={t("previous")}
                  >
                    ‹
                  </button>
                  <p className="nh-numeric text-small text-content-secondary">
                    {t("pageOf", { page, pages: totalPages })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="nh-khutba-arrow disabled:opacity-40"
                    aria-label={t("next")}
                  >
                    ›
                  </button>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </section>

      {active && activeIndex >= 0 ? (
        <MediaLightbox
          item={active}
          index={activeIndex}
          total={slideScope.length}
          onClose={() => {
            setActiveId(null);
            setSlideScope([]);
          }}
          onPrev={() => {
            const next = (activeIndex - 1 + slideScope.length) % slideScope.length;
            setActiveId(slideScope[next].id);
          }}
          onNext={() => {
            const next = (activeIndex + 1) % slideScope.length;
            setActiveId(slideScope[next].id);
          }}
        />
      ) : null}
    </article>
  );
}

function MediaLightbox({
  item,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  item: GalleryMediaItem;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("media");
  const yt = item.kind === "video" ? youtubeId(item.media_url) : null;
  const direct = item.kind === "video" && isDirectVideo(item.media_url);
  const canSlide = total > 1;

  const onCloseRef = useRef(onClose);
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);
  onCloseRef.current = onClose;
  onPrevRef.current = onPrev;
  onNextRef.current = onNext;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key === "ArrowLeft") onPrevRef.current();
      if (event.key === "ArrowRight") onNextRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-brand-950/80 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={item.event_name || item.caption || t("filters.all")}
      onClick={onClose}
    >
      <div className="mx-auto flex min-h-full items-center justify-center py-4">
        <div
          className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute end-3 top-3 z-20 inline-flex size-9 items-center justify-center rounded-full bg-brand-950/80 text-white hover:bg-brand-900"
            aria-label={t("close")}
          >
            ×
          </button>

          {canSlide ? (
            <>
              <button
                type="button"
                onClick={onPrev}
                className="absolute start-3 top-[38%] z-20 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl text-brand-900 shadow-md hover:bg-white"
                aria-label={t("previous")}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={onNext}
                className="absolute end-3 top-[38%] z-20 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl text-brand-900 shadow-md hover:bg-white"
                aria-label={t("next")}
              >
                ›
              </button>
            </>
          ) : null}

          <div className="relative max-h-[min(62dvh,28rem)] bg-brand-950 sm:max-h-[min(70dvh,36rem)]">
            <div className="relative aspect-video max-h-[inherit] w-full">
              {item.kind === "photo" ? (
                <Image
                  src={item.media_url}
                  alt={item.caption || item.event_name || ""}
                  fill
                  sizes="64rem"
                  className="object-contain"
                  unoptimized={item.media_url.startsWith("http")}
                  priority
                />
              ) : yt ? (
                <iframe
                  title={item.event_name || item.caption || "video"}
                  src={`https://www.youtube.com/embed/${yt}`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : direct ? (
                <video controls className="absolute inset-0 h-full w-full" src={item.media_url} />
              ) : (
                <a
                  href={item.media_url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white underline"
                >
                  {t("openVideo")}
                </a>
              )}
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-700">
                <EightPointStar size={12} />
                {item.kind === "video" ? t("filters.video") : t("filters.photo")}
              </p>
              {canSlide ? (
                <p className="nh-numeric text-xs font-semibold text-content-secondary">
                  {t("slideOf", { current: index + 1, total })}
                </p>
              ) : null}
            </div>
            <h3 className="mt-2 font-sans text-xl font-extrabold text-content">
              {item.event_name || t("untitledEvent")}
            </h3>
            {item.caption ? <p className="mt-2 text-sm text-content-secondary">{item.caption}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar" : locale === "en" ? "en" : "fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M7 5.5v9l8-4.5-8-4.5Z" />
    </svg>
  );
}
