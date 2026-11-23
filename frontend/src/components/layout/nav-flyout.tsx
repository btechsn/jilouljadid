"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import type { PlatformGroup } from "@/config/platform-nav";
import { cn } from "@/lib/utils";

export function NavFlyout({
  group,
  current,
  hrefOf,
  isExact,
  pathname,
  linkClassName,
}: {
  group: PlatformGroup;
  current: boolean;
  hrefOf: (path: string) => string;
  isExact: (path: string) => boolean;
  pathname: string;
  linkClassName?: string;
}) {
  const t = useTranslations("menu");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLeave = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  const show = () => {
    clearLeave();
    setOpen(true);
  };

  const hide = () => {
    clearLeave();
    leaveTimer.current = setTimeout(() => setOpen(false), 80);
  };

  const closeNow = () => {
    clearLeave();
    setOpen(false);
  };

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeNow();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      clearLeave();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-current={current ? "page" : undefined}
        className={cn(
          linkClassName ||
            "inline-flex items-center gap-1 whitespace-nowrap px-3 py-2 font-semibold uppercase tracking-wide",
          !linkClassName && (current || open ? "text-gold-700" : "text-content hover:text-gold-700"),
          "gap-1",
        )}
        onClick={() => setOpen((value) => !value)}
      >
        {t(`groups.${group.id}`)}
        <Chevron />
      </button>
      {open ? (
        <ul className="nh-drop absolute start-0 top-full z-[80] flex min-w-[11rem] flex-col gap-2 pt-2">
          {group.items.map((item) => {
            const active = isExact(item.href) || pathname.startsWith(`${hrefOf(item.href)}/`);
            return (
              <li key={item.href}>
                <Link
                  href={hrefOf(item.href)}
                  aria-current={active ? "page" : undefined}
                  className="block rounded-full bg-gold-300 px-4 py-2.5 text-center text-small font-semibold text-neutral-900 transition hover:-translate-y-0.5 hover:bg-gold-200"
                  onClick={closeNow}
                >
                  {t(`items.${item.key}`)}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3">
      <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
