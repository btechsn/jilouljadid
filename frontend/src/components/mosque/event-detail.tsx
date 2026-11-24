"use client";

import Image from "next/image";

import { isRemoteUpload } from "@/lib/media";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { EightPointStar } from "@/components/brand/ornaments";
import type { EventCard } from "@/components/mosque/event-board";
import { WhatsAppShare } from "@/components/share/whatsapp-share";
import { cn } from "@/lib/utils";

function formatWhen(iso: string, locale: string) {
  if (!iso?.trim()) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Dakar",
  }).format(date);
}

export function EventDetail({ event }: { event: EventCard }) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations("pages.events");
  const share = useTranslations("common");
  const listHref = `/${locale}/evenements`;
  const arabic = locale === "ar";

  const [showRegister, setShowRegister] = useState(false);
  const registerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (searchParams.get("inscription") === "1" && !event.isFinished && event.canRegister) {
      setShowRegister(true);
    }
  }, [searchParams, event.isFinished, event.canRegister]);

  useEffect(() => {
    if (!showRegister) return;
    const node = registerRef.current;
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showRegister]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const typeLabel = (value: string) => {
    try {
      return t(`types.${value}` as "types.community");
    } catch {
      return value;
    }
  };

  const when = formatWhen(event.startAt, locale);
  const meta = [when, event.location].filter(Boolean).join(" · ");
  const body = event.body?.trim() || event.description;
  const gallery = event.gallery?.length ? event.gallery : [event.image];

  const submit = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    setBusy(true);
    setStatus("idle");
    try {
      const response = await fetch(`/api/v1/mosque/events/${encodeURIComponent(event.id)}/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
        }),
      });
      if (!response.ok) {
        throw new Error("register-failed");
      }
      setStatus("ok");
      setFirstName("");
      setLastName("");
      setPhone("");
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="bg-white">
      <div className="nh-container py-10 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-700">
            <EightPointStar size={12} className="text-gold-500" />
            {event.isFinished ? t("badgePast") : t("badgeUpcoming")}
            {event.type ? ` · ${typeLabel(event.type)}` : null}
          </p>

          <h1
            className={cn(
              "mt-3 font-sans text-2xl font-extrabold tracking-tight text-content sm:text-3xl lg:text-4xl",
              arabic && "font-arabic",
            )}
          >
            {event.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <WhatsAppShare title={event.title} label={share("shareWhatsApp")} />
            {!event.isFinished && event.canRegister ? (
              <button
                type="button"
                onClick={() => {
                  setShowRegister(true);
                  setStatus("idle");
                }}
                className="inline-flex items-center rounded-full bg-brand-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-brand-800"
              >
                {t("participate")}
              </button>
            ) : null}
          </div>

          {showRegister ? (
            <section
              ref={registerRef}
              id="inscription"
              className="mt-6 scroll-mt-28 rounded-3xl bg-[#f3f4f6] p-6 sm:p-8"
            >
              <h2 className="font-sans text-xl font-extrabold text-content">{t("participate")}</h2>
              <p className="mt-1 text-sm text-content-secondary">{t("participant")}</p>
              {status === "ok" ? (
                <p className="mt-6 text-sm font-semibold text-brand-900">{t("registered")}</p>
              ) : (
                <form onSubmit={submit} className="mt-6 grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    autoFocus
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder={t("firstName")}
                    aria-label={t("firstName")}
                    className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-gold-300/50 sm:col-span-1"
                  />
                  <input
                    required
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder={t("lastName")}
                    aria-label={t("lastName")}
                    className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-gold-300/50"
                  />
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={t("phone")}
                    aria-label={t("phone")}
                    className="nh-numeric h-11 rounded-full border border-black/10 bg-white px-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-gold-300/50 sm:col-span-2"
                  />
                  {status === "error" ? (
                    <p className="text-sm text-red-700 sm:col-span-2">{t("registerError")}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => setShowRegister(false)}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-xs font-semibold uppercase tracking-wide text-content"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-brand-900 px-5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-brand-800 disabled:opacity-60"
                    >
                      {t("submit")}
                    </button>
                  </div>
                </form>
              )}
            </section>
          ) : null}

          {meta ? (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-content-secondary">
              <span className="inline-flex items-center gap-2 nh-numeric">
                <CalendarIcon />
                {meta}
              </span>
            </div>
          ) : null}

          <div className="relative mt-8 overflow-hidden rounded-2xl bg-brand-500/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image}
              alt=""
              data-essential=""
              className="aspect-video w-full object-cover object-top"
            />
          </div>

          {body.includes("<") ? (
            <div
              className="prose prose-neutral mt-8 max-w-none text-base leading-relaxed text-content-secondary prose-p:mb-4"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : (
            <div className="prose prose-neutral mt-8 max-w-none text-base leading-relaxed text-content-secondary prose-p:mb-4">
              {body.split(/\n+/).map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          )}

          {gallery.length > 1 ? (
            <section className="mt-10">
              <h2 className="font-sans text-lg font-extrabold text-content">{t("gallery")}</h2>
              <EventGalleryCarousel images={gallery} />
            </section>
          ) : null}

          {event.youtubeUrl ? (
            <a
              href={event.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center rounded-full bg-brand-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-brand-800"
            >
              {t("learnMore")}
            </a>
          ) : null}

          <div className="mt-10 border-t border-line pt-8">
            <Link
              href={listHref}
              className="inline-flex items-center gap-2 rounded-full border border-brand-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-brand-700 transition hover:bg-brand-700 hover:text-white"
            >
              ← {t("detailBack")}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function EventGalleryCarousel({ images }: { images: string[] }) {
  const t = useTranslations("common");
  const viewportRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(3);
  const total = images.length;
  const canSlide = total > 1;
  const gapPx = 12;
  const loop = canSlide ? [...images, ...images, ...images] : images;
  const startOffset = canSlide ? total : 0;

  const measure = () => {
    const width = viewportRef.current?.clientWidth ?? 0;
    if (!width) return;
    const count = width < 640 ? 1 : 3;
    const slide = (width - (count - 1) * gapPx) / count;
    setVisible(count);
    setStep(slide + gapPx);
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!canSlide) return;
    setIndex(startOffset);
  }, [canSlide, startOffset]);

  const go = (next: number) => {
    setAnimate(true);
    setIndex(next);
  };

  useEffect(() => {
    if (!canSlide || !animate) return;
    if (index >= startOffset + total || index < startOffset) {
      const timer = window.setTimeout(() => {
        setAnimate(false);
        setIndex(startOffset + ((index % total) + total) % total);
      }, 480);
      return () => window.clearTimeout(timer);
    }
  }, [animate, canSlide, index, startOffset, total]);

  useEffect(() => {
    if (!canSlide || paused) return;
    const timer = window.setInterval(() => go(index + 1), 4000);
    return () => window.clearInterval(timer);
  }, [canSlide, index, paused]);

  useEffect(() => {
    if (!canSlide) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") go(index - 1);
      if (event.key === "ArrowRight") go(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canSlide, index]);

  const slideWidth = step > 0 ? Math.max(step - gapPx, 0) : 0;

  return (
    <div
      aria-roledescription="carousel"
      className="relative mt-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={viewportRef} className="overflow-hidden">
        <ul
          className={cn("flex", animate && "transition-transform duration-500 ease-out")}
          style={{
            gap: `${gapPx}px`,
            transform: step ? `translateX(-${index * step}px)` : undefined,
          }}
        >
          {loop.map((src, i) => (
            <li
              key={`${src}-${i}`}
              className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-2xl ring-1 ring-black/5"
              style={{ width: slideWidth || undefined, flexBasis: slideWidth ? `${slideWidth}px` : `${100 / visible}%` }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 64rem) 20vw, 40vw"
                className="object-cover"
                unoptimized={isRemoteUpload(src)}
              />
            </li>
          ))}
        </ul>
      </div>

      {canSlide ? (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={t("previous")}
            className="absolute start-0 top-1/2 z-10 inline-flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl text-brand-900 shadow-md ring-1 ring-black/5 transition hover:bg-brand-50 sm:size-11"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={t("next")}
            className="absolute end-0 top-1/2 z-10 inline-flex size-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl text-brand-900 shadow-md ring-1 ring-black/5 transition hover:bg-brand-50 sm:size-11"
          >
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="size-4">
      <rect x="3" y="4.5" width="14" height="12" rx="2" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" strokeLinecap="round" />
    </svg>
  );
}
