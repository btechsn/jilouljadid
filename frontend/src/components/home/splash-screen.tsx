import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AppOpen } from "@/components/home/app-open";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { serverApiFetch } from "@/lib/server-api";

const DOORS = [
  { href: "a-propos", key: "about", tone: "solid" },
  { href: "evenements", key: "events", tone: "gold" },
  { href: "communaute", key: "community", tone: "white" },
  { href: "mediatheque", key: "media", tone: "white" },
] as const;

export async function SplashScreen({ locale }: { locale: string }) {
  const t = await getTranslations("splash");
  const arabic = locale === "ar";
  const settings = await serverApiFetch<{ home_image_url?: string | null }>("/settings/public", {
    timeoutMs: 2500,
    revalidate: 30,
    locale,
  });
  const heroSrc =
    typeof settings?.home_image_url === "string" && settings.home_image_url.trim()
      ? settings.home_image_url
      : "/brand/intro-lecon.jpg";

  return (
    <>
      <AppOpen />
      <div className="nh-app-open" aria-hidden="true">
        <span className="nh-app-open-glow" />
        <div className="nh-app-open-mark">
          <span className="nh-app-open-ring" />
          <span className="nh-app-open-ring nh-app-open-ring-late" />
          <span className="nh-app-open-disc">
            <Image
              src="/brand/logo-jj.jpg"
              alt=""
              width={168}
              height={168}
              priority
              className="size-full object-cover"
            />
          </span>
        </div>
        <p lang={arabic ? "ar" : locale} dir={arabic ? "rtl" : "ltr"} className={`nh-app-open-name ${arabic ? "font-arabic" : "font-sans"}`}>
          {arabic ? t("arabicName") : t("name")}
        </p>
        <span className="nh-app-open-line" />
      </div>
      <main className="nh-home relative min-h-dvh overflow-hidden bg-brand-950 text-white">
      <Image
        src={heroSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-center"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-brand-950/84" />
      <span aria-hidden="true" className="absolute inset-x-0 top-0 z-20 h-px bg-gold-300/70" />

      <header className="absolute end-0 top-0 z-20 px-5 py-5 sm:px-8">
        <LocaleSwitcher />
      </header>

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center">
        <div className="flex flex-col items-center">
          <div className="nh-logo-in relative size-[clamp(6.75rem,22dvh,11rem)]">
            <span className="nh-ring absolute -inset-2.5 rounded-full border border-gold-300/50" />
            <span className="absolute inset-0 rounded-full border border-gold-300" />
            <span className="absolute inset-[5px] overflow-hidden rounded-full">
              <Image
                src="/brand/logo-jj.jpg"
                alt=""
                width={168}
                height={168}
                priority
                data-essential=""
                className="size-full object-cover"
              />
            </span>
          </div>

          <h1
            lang={arabic ? "ar" : locale}
            dir={arabic ? "rtl" : "ltr"}
            className={`nh-intro mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl ${arabic ? "font-arabic" : "font-sans"}`}
            style={{ animationDelay: "0.42s" }}
          >
            {arabic ? t("arabicName") : t("name")}
          </h1>
          {arabic ? null : (
            <p className="type-eyebrow nh-intro mt-3 text-gold-300" style={{ animationDelay: "0.56s" }}>
              {t("place")}
            </p>
          )}
        </div>

        <p
          className="nh-intro mt-8 max-w-md text-base text-white/90 sm:text-lg"
          style={{ animationDelay: "0.7s" }}
        >
          {t("lead")}
        </p>

        <nav
          aria-label={t("lead")}
          className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4"
        >
          {DOORS.map((door, index) => (
            <Link
              key={door.href}
              href={`/${locale}/${door.href}`}
              className={
                door.tone === "solid"
                  ? "nh-fade nh-door nh-door-solid bg-gold-300 px-8 py-3.5 text-center text-small font-semibold tracking-wide text-neutral-900 uppercase sm:min-w-36"
                  : door.tone === "gold"
                    ? "nh-fade nh-door nh-door-gold border border-gold-300 px-8 py-3.5 text-center text-small font-semibold tracking-wide text-gold-300 uppercase sm:min-w-36"
                    : "nh-fade nh-door nh-door-line border border-white px-8 py-3.5 text-center text-small font-semibold tracking-wide text-white uppercase sm:min-w-36"
              }
              style={{ animationDelay: `${0.9 + index * 0.14}s` }}
            >
              {t(`${door.key}.title`)}
            </Link>
          ))}
        </nav>
      </div>
    </main>
    </>
  );
}
