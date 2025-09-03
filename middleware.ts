import { NextRequest, NextResponse } from "next/server";

const locales = ["th", "en", "zh"];
const defaultLocale = "th";

function getPreferredLocale(header: string | null) {
  if (!header) return defaultLocale;

  const languages = header
    .split(",")
    .map((part) => {
      const [lang, qValue] = part.trim().split(";q=");
      return {
        lang: lang.toLowerCase().split("-")[0],
        q: qValue ? parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of languages) {
    if (locales.includes(lang)) return lang;
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

  return NextResponse.redirect(new URL(`/${redirectLocale}${pathname}`, req.url));
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
