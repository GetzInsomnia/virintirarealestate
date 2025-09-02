import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { GetStaticProps } from "next";
import nextI18NextConfig from "../next-i18next.config";
import defaultSeo from "../next-seo.config";

export default function Custom404() {
  const { t } = useTranslation("common");
  const { locale, defaultLocale } = useRouter();
  const lang =
    locale ?? defaultLocale ?? nextI18NextConfig.i18n.defaultLocale;
  const keywords = t('seo_keywords', { returnObjects: true }) as string[];
  const ogLocale =
    lang === "en" ? "en_US" : lang === "zh" ? "zh_CN" : "th_TH";
  const baseUrl = defaultSeo.baseUrl;
  const pageUrl =
    lang === defaultLocale
      ? `${baseUrl}/404`
      : `${baseUrl}/${lang}/404`;
  return (
    <>
      <NextSeo
        title={`404 - ${t("seo_title")}`}
        canonical={pageUrl}
        openGraph={{
          ...defaultSeo.openGraph,
          locale: ogLocale,
          url: pageUrl,
        }}
        additionalMetaTags={[{
          name: 'keywords',
          content: keywords.join(', '),
        }]}
        languageAlternates={[
          { hrefLang: 'th', href: `${baseUrl}/th/404` },
          { hrefLang: 'en', href: `${baseUrl}/en/404` },
          { hrefLang: 'zh', href: `${baseUrl}/zh/404` },
          { hrefLang: 'x-default', href: `${baseUrl}/404` },
        ]}
      />
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1>404</h1>
        <p>{t("notFound")}</p>
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
