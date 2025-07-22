import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { GetStaticProps } from "next";
import nextI18NextConfig from "../next-i18next.config";

export default function Custom500() {
  const { t } = useTranslation("common");
  const { locale, defaultLocale } = useRouter();
  const lang =
    locale ?? defaultLocale ?? nextI18NextConfig.i18n.defaultLocale;
  const ogLocale = lang === "en" ? "en_US" : "th_TH";
  return (
    <>
      <NextSeo
        title={`500 - ${t("seo_title")}`}
        openGraph={{ locale: ogLocale }}
      />
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1>500</h1>
        <p>{t("internal_error")}</p>
        <p>
          <a href={`/${lang}`}>{t("back_home")}</a>
        </p>
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
