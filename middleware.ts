import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";

const locales = ["th", "en", "zh"];
const defaultLocale = "th";

function getPreferredLocale(header: string | null) {
  if (!header) return defaultLocale;

  try {
    const negotiator = new Negotiator({
      headers: { "accept-language": header },
    });
    const language = negotiator.language(locales);
    if (language) return language;
  } catch {
    // Ignore parsing errors and fall back to default locale
  }

  return defaultLocale;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  )
    return NextResponse.next();

  const pathLocale = pathname.split("/")[1];
  if (locales.includes(pathLocale)) {
    return NextResponse.next();
  }

  const redirectLocale = getPreferredLocale(
    req.headers.get("accept-language")
  );

  return NextResponse.redirect(
    new URL(`/${redirectLocale}${pathname}`, req.url),
    308
  );
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
