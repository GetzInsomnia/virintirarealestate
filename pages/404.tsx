import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { GetStaticProps } from "next";
import nextI18NextConfig from "../next-i18next.config";

export default function Custom404() {
  const { t } = useTranslation("common");
  const { asPath } = useRouter();
  const lang = asPath.split("/")[1] || nextI18NextConfig.i18n.defaultLocale;
  const ogLocale = lang === "en" ? "en_US" : "th_TH";
  return (
    <>
      <NextSeo
        title={`404 - ${t("seo_title")}`}
        openGraph={{ locale: ogLocale }}
      />
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1>404</h1>
        <p>{t("notFound")}</p>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    ...(await serverSideTranslations(nextI18NextConfig.i18n.defaultLocale, ["common"])),
  },
});
