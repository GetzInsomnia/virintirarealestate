import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import * as NextSeo from "next-seo";
import defaultSeo from "../next-seo.config";

function MyApp({ Component, pageProps }: AppProps) {
  const baseUrl = defaultSeo.baseUrl;
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Virintira",
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    sameAs: [
      "https://twitter.com/virintira",
      "https://www.facebook.com/virintira",
    ],
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Virintira",
    url: baseUrl,
  };

  const { JsonLd: NextSeoJsonLd } = NextSeo as any;
  const ESCAPE_ENTITIES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  };
  const ESCAPE_REGEX = new RegExp("[" + Object.keys(ESCAPE_ENTITIES).join("") + "]", "g");
  const ESCAPE_REPLACER = (t: string) => ESCAPE_ENTITIES[t];
  const safeJsonLdReplacer = (_: string, value: any) => {
    switch (typeof value) {
      case "object":
        return value === null ? undefined : value;
      case "number":
      case "boolean":
      case "bigint":
        return value;
      case "string":
        return value.replace(ESCAPE_REGEX, ESCAPE_REPLACER);
      default:
        return undefined;
    }
  };
  const JsonLd =
    NextSeoJsonLd ??
    (({ scriptKey, scriptId, ...rest }: any) => (
      <script
        type="application/ld+json"
        id={scriptId}
        data-testid={scriptId}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(rest, safeJsonLdReplacer),
        }}
        key={`jsonld-${scriptKey}`}
      />
    ));

  return (
    <>
      <JsonLd
        scriptKey="organization"
        scriptId="organization-jsonld"
        {...orgJsonLd}
      />
      <JsonLd
        scriptKey="website"
        scriptId="website-jsonld"
        {...webSiteJsonLd}
      />
      <Component {...pageProps} />
    </>
  );
}

export default appWithTranslation(MyApp);
