import { useTranslations } from "next-intl";
import Head from "next/head";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
export { getStaticProps } from "../../lib/getStaticProps";

export default function Home() {
  const t = useTranslations();
  return (
    <>
      <Head>
        <title>{t("seo_title")}</title>
        <meta name="description" content={t("seo_description")} />
      </Head>
      <main>
        <h1>{t("welcome")}</h1>
        <LanguageSwitcher />
      </main>
    </>
  );
}
