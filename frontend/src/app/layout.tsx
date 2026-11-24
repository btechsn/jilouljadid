import { headers } from "next/headers";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Suspense } from "react";
import type { Metadata } from "next";

import { OrnamentDefs } from "@/components/brand/ornaments";
import { BootScripts } from "@/components/layout/boot-scripts";
import { ComfortControls } from "@/components/layout/comfort-controls";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { AuthProvider } from "@/hooks/useAuth";
import { fontVariables } from "@/lib/fonts";
import { LOCALE_DIRECTION, type Locale } from "@/i18n/routing";

import "@/app/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const path = (await headers()).get("x-pathname") ?? "/fr";
  const rest = path.replace(/^\/(fr|en|ar)(?=\/|$)/, "");
  const languages = {
    fr: `/fr${rest}`,
    en: `/en${rest}`,
    ar: `/ar${rest}`,
    "x-default": `/fr${rest}`,
  };

  return {
    alternates: { languages },
    appleWebApp: {
      capable: true,
      title: "Jiloul Jadid",
      statusBarStyle: "black-translucent",
    },
    icons: {
      icon: [
        { url: "/icons/icon-32.png?v=jj", sizes: "32x32", type: "image/png" },
        { url: "/icons/icon-192.png?v=jj", sizes: "192x192", type: "image/png" },
      ],
      shortcut: ["/favicon.ico?v=jj"],
      apple: [{ url: "/icons/icon-180.png?v=jj", sizes: "180x180" }],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "comfort" });
  const dir = LOCALE_DIRECTION[locale] ?? "ltr";

  return (
    <html lang={locale} dir={dir} className={fontVariables} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-dvh bg-canvas font-sans text-content antialiased">
        <BootScripts />
        <OrnamentDefs />

        <a
          href="#nh-main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          {t("skip")}
        </a>

        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            {children}
            <ComfortControls />
            <InstallPrompt />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
