import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { GetStaticProps } from "next";
import nextI18NextConfig from "../next-i18next.config";
import defaultSeo from "../next-seo.config";
import { buildUrl } from "../lib/url";

export default function Custom500() {
  const { t } = useTranslation("common");
  const { locale, defaultLocale } = useRouter();
  const lang =
    locale ?? defaultLocale ?? nextI18NextConfig.i18n.defaultLocale;
  const keywords = t('seo_keywords', { returnObjects: true }) as string[];
  const ogLocale =
    lang === "en" ? "en_US" : lang === "zh" ? "zh_CN" : "th_TH";
  const { pageUrl } = buildUrl(lang, "/500");
  return (
    <>
      <NextSeo
        title={`500 - ${t("seo_title")}`}
        canonical={pageUrl}
        noindex
        nofollow
        openGraph={{
          ...defaultSeo.openGraph,
          locale: ogLocale,
          url: pageUrl,
        }}
        additionalMetaTags={[
          { name: 'keywords', content: keywords.join(', ') },
        ]}
        languageAlternates={[
          { hrefLang: 'th', href: buildUrl('th', '/500').pageUrl },
          { hrefLang: 'en', href: buildUrl('en', '/500').pageUrl },
          { hrefLang: 'zh', href: buildUrl('zh', '/500').pageUrl },
          { hrefLang: 'x-default', href: buildUrl('th', '/500').pageUrl },
        ]}
      />
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1>500</h1>
        <p>{t("internal_error")}</p>
        <p>
          <a href={`/${lang}`}>{t("back_home")}</a>
        </p>
        <p>{keywords.join(', ')}</p>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(
      locale ?? nextI18NextConfig.i18n.defaultLocale,
      ["common"]
    )),
  },
});
