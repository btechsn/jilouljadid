import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales } from "./i18n/request";

const handleI18n = createMiddleware({
  locales,
  defaultLocale: "fr",
  localeDetection: true,
});

const ADMIN_BASE =
  process.env.NEXT_PUBLIC_ADMIN_URL || "http://127.0.0.1:8000/jj/administration";

/** Redirige les URLs admin tapées sur le front Next vers Filament (Laravel). */
function adminRedirect(pathname: string): string | null {
  const match = pathname.match(/^(?:\/(?:fr|en|ar))?\/jj\/administration(\/.*)?$/);
  if (!match) return null;
  const rest = match[1] ?? "";
  return `${ADMIN_BASE.replace(/\/$/, "")}${rest}`;
}

export default function middleware(request: NextRequest) {
  const toAdmin = adminRedirect(request.nextUrl.pathname);
  if (toAdmin) {
    return NextResponse.redirect(toAdmin);
  }

  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return handleI18n(new NextRequest(request, { headers }));
}

export const config = {
  matcher: ["/", "/(fr|en|ar)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
