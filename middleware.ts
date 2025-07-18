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

  // detect preferred language
  const acceptLang = req.headers.get("accept-language") || "";
  const preferred = acceptLang.split(",")[0].split("-")[0];
  const redirectLocale = locales.includes(preferred) ? preferred : defaultLocale;

  return NextResponse.redirect(new URL(`/${redirectLocale}${pathname}`, req.url));
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
