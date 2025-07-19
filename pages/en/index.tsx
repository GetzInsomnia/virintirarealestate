import { useTranslation } from "next-i18next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Home() {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const ogLocale = locale === "en" ? "en_US" : "th_TH";
  return (
    <>
      <NextSeo
        title={t("seo_title")}
        description={t("seo_description")}
        openGraph={{ locale: ogLocale }}
      />
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
