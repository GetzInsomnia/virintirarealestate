import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import Script from "next/script";
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

  return (
    <>
      <Script
        id="organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Script
        id="website-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <Component {...pageProps} />
    </>
  );
}

export default appWithTranslation(MyApp);
