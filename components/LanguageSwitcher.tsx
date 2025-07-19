import Link from "next/link";
import { useRouter } from "next/router";

export function LanguageSwitcher() {
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Link href={asPath} locale="th">
        <button disabled={locale === "th"}>ไทย</button>
      </Link>
      <Link href={asPath} locale="en">
        <button disabled={locale === "en"}>English</button>
      </Link>
    </div>
  );
}
