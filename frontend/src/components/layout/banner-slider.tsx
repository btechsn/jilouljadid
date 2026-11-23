"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export type BannerSlide = {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  image?: string;
  /** Position CSS object-position, ex. "center 35%" */
  focus?: string;
  /** cover = photo recadrée ; contain = flyer pleine largeur */
  fit?: "cover" | "contain";
};

export function BannerSlider({ slides }: { slides: BannerSlide[] }) {
  const t = useTranslations("common");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [mounted, paused, slides.length]);

  const go = (next: number) => {
    setIndex((value) => (next + slides.length) % slides.length);
  };

  const safeIndex = mounted ? index : 0;
  const slide = slides[safeIndex] ?? slides[0];
  if (!slide) return null;

  const flyer = slide.fit === "contain";
  const imageSrc = slide.image || "/brand/intro-lecon.jpg";

  return (
    <section
      aria-roledescription="carousel"
      className={cn(
        "relative w-full overflow-hidden bg-brand-950 text-white",
        flyer ? "min-h-0" : "min-h-[24rem] sm:min-h-[34rem]",
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {flyer ? (
        <div className="relative h-[min(70vw,28rem)] w-full overflow-hidden sm:h-[32rem]">
          <img
            src={imageSrc}
            alt=""
            width={1600}
            height={2000}
            data-essential=""
            className="absolute inset-0 size-full object-cover object-[center_20%]"
            decoding="async"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-brand-950/35" />
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 pb-24 pt-16 text-center sm:px-16 sm:pb-28 sm:pt-20">
            <p className="type-eyebrow max-w-full px-2 text-center text-gold-300 drop-shadow">{slide.eyebrow}</p>
            <h2 className="nh-banner-title mt-3 font-sans font-extrabold tracking-tight text-white uppercase drop-shadow-md">
              {slide.title}
            </h2>
            <Link
              href={slide.href}
              className="mt-6 inline-flex rounded-full bg-gold-300 px-6 py-3 text-small font-semibold tracking-wide text-neutral-900 uppercase shadow-lg shadow-brand-950/40 transition hover:bg-white"
            >
              {t("learnMore")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative min-h-[24rem] w-full sm:min-h-[34rem]">
          <img
            src={imageSrc}
            alt=""
            data-essential=""
            className="absolute inset-0 size-full object-cover"
            style={{ objectPosition: slide.focus || "center 35%" }}
            decoding="async"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-brand-950/50" />
          <div className="relative flex min-h-[24rem] w-full flex-col items-center justify-center px-4 pb-28 pt-14 text-center sm:min-h-[34rem] sm:px-16 sm:pb-28 sm:pt-16">
            <p className="type-eyebrow max-w-full px-2 text-center text-gold-300">{slide.eyebrow}</p>
            <h2 className="nh-banner-title mt-3 font-sans font-extrabold tracking-tight text-white uppercase">
              {slide.title}
            </h2>
            <Link
              href={slide.href}
              className="mt-6 inline-flex rounded-full bg-gold-300 px-6 py-3 text-small font-semibold tracking-wide text-neutral-900 uppercase transition hover:bg-white"
            >
              {t("learnMore")}
            </Link>
          </div>
        </div>
      )}

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(safeIndex - 1)}
            aria-label={t("previous")}
            className="absolute start-2 top-1/2 z-40 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-brand-900 shadow-md transition hover:bg-white sm:start-6 sm:size-11 sm:text-2xl"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(safeIndex + 1)}
            aria-label={t("next")}
            className="absolute end-2 top-1/2 z-40 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-brand-900 shadow-md transition hover:bg-white sm:end-6 sm:size-11 sm:text-2xl"
          >
            ›
          </button>
        </>
      ) : null}
    </section>
  );
}
