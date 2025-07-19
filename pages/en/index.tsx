import Head from "next/head";
import { useTranslation } from "next-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Home() {
  const { t } = useTranslation("common");
  return (
    <>
      <Head>
        <title>{t("seo_title")}</title>
        <meta name="description" content={t("seo_description")} />
      </Head>
      <main>
        <LanguageSwitcher />
        <h1>{t("welcome")}</h1>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});
