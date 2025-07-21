import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextSeo } from "next-seo";
import nextI18NextConfig from "../../next-i18next.config";
import LanguageSwitcher from "../../components/LanguageSwitcher";

export default function Home() {
  const { t } = useTranslation("common");
  const { query } = useRouter();
  const lang = (query.lang as string) || nextI18NextConfig.i18n.defaultLocale;
  const ogLocale = lang === "en" ? "en_US" : "th_TH";
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

export const getStaticPaths: GetStaticPaths = async () => {
  const { locales } = nextI18NextConfig.i18n;
  const paths = locales.map((lang) => ({ params: { lang } }));
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lang = (params?.lang as string) || nextI18NextConfig.i18n.defaultLocale;
  return {
    props: {
      ...(await serverSideTranslations(lang, ["common"])),
    },
  };
};
