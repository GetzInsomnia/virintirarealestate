import { NextRequest, NextResponse } from "next/server";

const locales = ["th", "en"];
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

  // Detect the preferred language from the request headers. If the client
  // sends an unsupported language, fall back to the default locale.
  const redirectLocale = defaultLocale;

  return NextResponse.redirect(new URL(`/${redirectLocale}${pathname}`, req.url));
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
