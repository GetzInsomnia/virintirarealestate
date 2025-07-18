import Link from "next/link";
import { useRouter } from "next/router";

export function LanguageSwitcher() {
  const router = useRouter();
  const { locales, locale, asPath } = router;

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {locales?.map((lng) =>
        lng !== locale ? (
          <Link key={lng} href={asPath} locale={lng}>
            <button style={{ padding: '4px 12px', fontWeight: lng === locale ? 'bold' : 'normal' }}>
              {lng.toUpperCase()}
            </button>
          </Link>
        ) : null
      )}
    </div>
  );
}
