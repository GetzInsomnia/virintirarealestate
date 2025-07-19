import Head from "next/head";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
export { getStaticProps } from "../lib/getStaticProps";

export default function Custom404() {
  const t = useTranslations();
  return (
    <>
      <Head>
        <title>{t("seo_404_title", { defaultValue: "404 Not Found" })}</title>
        <meta
          name="description"
          content={t("seo_404_description", { defaultValue: "Sorry, the page was not found." })}
        />
        <html lang={t("lang")} />
      </Head>
      <main style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <LanguageSwitcher />
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>404</h1>
        <p style={{ fontSize: "1.25rem" }}>{t("not_found", { defaultValue: "ขออภัย ไม่พบหน้านี้" })}</p>
      </main>
    </>
  );
}
