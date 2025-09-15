import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { DefaultSeo } from "next-seo";
import JsonLd from "../components/JsonLd";
import { useRouter } from "next/router";
import { buildUrl } from "../lib/url";
import defaultSeo from "../next-seo.config";
import { CurrencyProvider } from "../src/context/CurrencyContext";
import { prompt, inter, notoSC } from "../src/styles/fonts";

function MyApp({ Component, pageProps }: AppProps) {
  const { locale, defaultLocale } = useRouter();
  const { baseUrl, siteUrl } = buildUrl(locale ?? defaultLocale);
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Virintira",
    url: siteUrl,
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
    url: siteUrl,
  };

  return (
    <div className={`${prompt.variable} ${inter.variable} ${notoSC.variable}`}>
      <DefaultSeo {...defaultSeo} />
      <JsonLd scriptId="organization-jsonld" {...orgJsonLd} />
      <JsonLd scriptId="website-jsonld" {...webSiteJsonLd} />
      <CurrencyProvider>
        <Component {...pageProps} />
      </CurrencyProvider>
    </div>
  );
}

export default appWithTranslation(MyApp);
