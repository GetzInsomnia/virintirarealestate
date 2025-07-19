import Head from "next/head";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
export { getStaticProps } from "../../lib/getStaticProps";

export default function Home() {
  const t = useTranslations();
  return (
    <>
      <Head>
        <title>{t("seo_title")}</title>
        <meta name="description" content={t("seo_description")} />
        <html lang={t("lang")} />
      </Head>
      <main>
        <LanguageSwitcher />
        <h1>{t("welcome")}</h1>
      </main>
    </>
  );
}
