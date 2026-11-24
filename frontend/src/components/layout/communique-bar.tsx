"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

export type CommuniqueItem = {
  id: string;
  text: string;
  href?: string;
};

/** Bandeau des communiqués : le texte défile sans s'arrêter. */
export function CommuniqueBar({
  items,
  label,
  listHref,
}: {
  items: CommuniqueItem[];
  label: string;
  listHref: string;
}) {
  if (items.length === 0) return null;

  const characters = items.reduce((total, item) => total + item.text.length, 0);
  const durationSeconds = Math.min(180, Math.max(80, Math.round(characters * 0.28)));
  // Répéter assez de fois pour que la piste dépasse clairement l’écran.
  const copies = Math.max(1, Math.ceil(80 / Math.max(characters, 1)));
  const loopItems = Array.from({ length: copies }, (_, copy) =>
    items.map((item) => ({ ...item, id: `${item.id}__${copy}` })),
  ).flat();

  return (
    <div className="absolute inset-x-0 top-0 z-30 flex max-w-full items-center gap-2 overflow-hidden bg-gradient-to-b from-brand-950/70 to-transparent px-3 pb-6 pt-3 sm:gap-3 sm:px-8">
      <Link
        href={listHref}
        className="shrink-0 rounded-full bg-gold-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-neutral-900 transition hover:bg-gold-200"
      >
        {label}
      </Link>
      <div className="nh-marquee-viewport relative min-w-0 flex-1 overflow-hidden py-1">
        <div
          aria-hidden="true"
          className="nh-marquee-track"
          style={{ "--nh-marquee-duration": `${durationSeconds}s` } as CSSProperties}
        >
          <CommuniqueRun items={loopItems} runKey="a" />
          <CommuniqueRun items={loopItems} runKey="b" />
        </div>
        <ul className="sr-only">
          {items.map((item) => (
            <li key={item.id}>
              {item.href ? <a href={item.href}>{item.text}</a> : item.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CommuniqueRun({ items, runKey }: { items: CommuniqueItem[]; runKey: string }) {
  return (
    <div className="flex shrink-0 items-center">
      {items.map((item) => {
        const className =
          "whitespace-nowrap px-8 text-sm font-semibold text-white underline-offset-4 transition hover:underline sm:text-base";
        return (
          <span key={`${runKey}-${item.id}`} className="flex items-center">
            {item.href ? (
              <Link href={item.href} tabIndex={-1} className={className}>
                {item.text}
              </Link>
            ) : (
              <span className={className}>{item.text}</span>
            )}
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-gold-300" />
          </span>
        );
      })}
    </div>
  );
}
