import { useRouter } from "next/router";
export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, asPath } = router;
  return (
    <div style={{ marginTop: 24 }}>
      <button
        disabled={locale === "en"}
        onClick={() => router.push(asPath, asPath, { locale: "en" })}
      >EN</button>
      <button
        disabled={locale === "th"}
        onClick={() => router.push(asPath, asPath, { locale: "th" })}
      >TH</button>
    </div>
  );
}
