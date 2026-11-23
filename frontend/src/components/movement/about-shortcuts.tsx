"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Locale = "fr" | "en" | "ar";

type Figure = {
  value: number | null;
  label: string;
};

type Shortcut = {
  href: string;
  label: string;
  tone: string;
  icon: "people" | "aims" | "events" | "community";
  figures: Figure[];
};

/** Compteurs du mouvement.
 *  La 4ᵉ carte ouvre vers la communauté : sections, canaux et directs à venir.
 *  `members` : effectif par défaut, à remplacer par le chiffre réel. */
const INDICATORS = {
  axes: 3,
  aims: 4,
  events: 3,
  members: 100,
};

const COPY: Record<
  Locale,
  {
    aria: string;
    shortcuts: Array<{
      href: string;
      label: string;
      icon: Shortcut["icon"];
      figures: Figure[];
    }>;
  }
> = {
  fr: {
    aria: "Raccourcis du mouvement",
    shortcuts: [
      {
        href: "#mouvement",
        label: "Le mouvement",
        icon: "people",
        figures: [{ value: INDICATORS.axes, label: "Axes" }],
      },
      {
        href: "#objectifs",
        label: "Objectifs",
        icon: "aims",
        figures: [{ value: INDICATORS.aims, label: "Priorités" }],
      },
      {
        href: "/evenements",
        label: "Événements",
        icon: "events",
        figures: [{ value: INDICATORS.events, label: "Moments" }],
      },
      {
        href: "/communaute",
        label: "Communauté",
        icon: "community",
        figures: [
          { value: INDICATORS.members, label: "Membres" },
        ],
      },
    ],
  },
  en: {
    aria: "Movement shortcuts",
    shortcuts: [
      {
        href: "#mouvement",
        label: "The movement",
        icon: "people",
        figures: [{ value: INDICATORS.axes, label: "Pillars" }],
      },
      {
        href: "#objectifs",
        label: "Aims",
        icon: "aims",
        figures: [{ value: INDICATORS.aims, label: "Priorities" }],
      },
      {
        href: "/evenements",
        label: "Events",
        icon: "events",
        figures: [{ value: INDICATORS.events, label: "Moments" }],
      },
      {
        href: "/communaute",
        label: "Community",
        icon: "community",
        figures: [
          { value: INDICATORS.members, label: "Members" },
        ],
      },
    ],
  },
  ar: {
    aria: "اختصارات الحركة",
    shortcuts: [
      {
        href: "#mouvement",
        label: "الحركة",
        icon: "people",
        figures: [{ value: INDICATORS.axes, label: "محاور" }],
      },
      {
        href: "#objectifs",
        label: "الأهداف",
        icon: "aims",
        figures: [{ value: INDICATORS.aims, label: "أولويات" }],
      },
      {
        href: "/evenements",
        label: "الفعاليات",
        icon: "events",
        figures: [{ value: INDICATORS.events, label: "محطات" }],
      },
      {
        href: "/communaute",
        label: "المجتمع",
        icon: "community",
        figures: [
          { value: INDICATORS.members, label: "أعضاء" },
        ],
      },
    ],
  },
};

const TONES = ["bg-brand-800", "bg-primary", "bg-brand-900", "bg-brand-700"] as const;

function hrefOf(locale: string, href: string) {
  if (href.startsWith("#")) return href;
  return `/${locale}${href}`;
}

function useCountUp(target: number, active: boolean, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

function FigureValue({ target, active }: { target: number | null; active: boolean }) {
  const counted = useCountUp(target ?? 0, active && target !== null);
  if (target === null) return <>–</>;
  return <>{counted}</>;
}

export function AboutShortcuts({ locale }: { locale: string }) {
  const lang: Locale = locale === "en" || locale === "ar" ? locale : "fr";
  const copy = COPY[lang];
  const arabic = lang === "ar";
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      setSettled(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setSettled(true), 900);
    return () => window.clearTimeout(timer);
  }, [visible]);

  return (
    <nav
      ref={ref}
      aria-label={copy.aria}
      className="nh-container relative z-10 -mt-10 grid grid-cols-2 gap-2 sm:-mt-12 sm:gap-3 lg:grid-cols-4"
    >
      {copy.shortcuts.map((item, index) => (
        <Link
          key={item.href}
          href={hrefOf(locale, item.href)}
          style={{ transitionDelay: settled ? "0ms" : visible ? `${index * 90}ms` : "0ms" }}
          className={`nh-shortcut-card ${visible ? "nh-shortcut-card--visible" : ""}`}
        >
          <span
            className={`${TONES[index]} nh-shortcut-card__inner flex min-h-32 flex-col items-center justify-center gap-1.5 px-2 py-4 text-center text-white sm:min-h-36 sm:gap-2 sm:px-4 sm:py-5`}
          >
            <ShortcutIcon name={item.icon} />
            <span className="flex max-w-full flex-wrap items-end justify-center gap-x-3 gap-y-1">
              {item.figures.map((figure) => (
                <span key={figure.label} className="flex min-w-0 flex-col items-center">
                  <span className="nh-numeric text-xl font-extrabold leading-none text-white sm:text-2xl">
                    <FigureValue target={figure.value} active={visible} />
                  </span>
                  <span
                    className={`mt-1 max-w-full text-[0.65rem] leading-tight text-white/80 sm:text-xs ${arabic ? "font-arabic" : ""}`}
                  >
                    {figure.label}
                  </span>
                </span>
              ))}
            </span>
            <span
              className={`max-w-full text-xs font-semibold leading-tight sm:text-small ${arabic ? "font-arabic" : ""}`}
            >
              {item.label}
            </span>
          </span>
        </Link>
      ))}
    </nav>
  );
}

function ShortcutIcon({ name }: { name: Shortcut["icon"] }) {
  const common = "size-7 text-gold-300";
  const icons: Record<Shortcut["icon"], ReactNode> = {
    people: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={common}>
        <circle cx="9" cy="8" r="2.5" />
        <circle cx="16" cy="9" r="2" />
        <path d="M4.5 18c.8-2.5 2.6-3.8 4.5-3.8S12.7 15.5 13.5 18" strokeLinecap="round" />
        <path d="M13.2 15.2c1.1-.7 2.4-1 3.8-1 1.6 0 3 .6 3.8 2.3" strokeLinecap="round" />
      </svg>
    ),
    aims: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={common}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      </svg>
    ),
    events: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={common}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3.5v3M16 3.5v3M4 10h16" strokeLinecap="round" />
      </svg>
    ),
    community: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={common}>
        <path d="M5 10a7 7 0 0 1 14 0" strokeLinecap="round" />
        <path d="M8.5 13.5a3.5 3.5 0 0 1 7 0" strokeLinecap="round" />
        <circle cx="12" cy="18" r="1.25" fill="currentColor" stroke="none" />
      </svg>
    ),
  };
  return icons[name];
}
