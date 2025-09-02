import { NextRequest, NextResponse } from "next/server";

const locales = ["th", "en", "zh"];
const defaultLocale = "th";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) return NextResponse.next();

  const pathLocale = pathname.split("/")[1];
  if (locales.includes(pathLocale)) {
    return NextResponse.next();
  }

  // Always redirect to the default locale.
  // Previous versions inspected the Accept-Language header to pick a locale.
  const redirectLocale = defaultLocale;

  return NextResponse.redirect(new URL(`/${redirectLocale}${pathname}`, req.url));
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
