import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { GetStaticProps } from "next";

export default function Custom404() {
  const { t } = useTranslation("common");
  return (
    <>
      <Head>
        <title>404 - {t("seo_title")}</title>
      </Head>
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1>404</h1>
        <p>{t("notFound") || "Not Found"}</p>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "th", ["common"])),
  },
});
