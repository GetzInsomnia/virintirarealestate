import defaultSeo from "../next-seo.config";

export function buildUrl(locale: string | undefined, path = "") {
  const lang = locale || "th";
  const baseUrl = defaultSeo.baseUrl.replace(/\/$/, "");
  const siteUrl = `${baseUrl}/${lang}`;
  const pageUrl =
    path && path !== "/"
      ? `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`
      : siteUrl;
  return { baseUrl, siteUrl, pageUrl };
}
