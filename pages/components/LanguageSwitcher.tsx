import Link from 'next/link';
import { useRouter } from 'next/router';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { pathname, asPath, query } = router;
  const locale = router.locale || 'th';

  return (
    <div style={{ marginBottom: 24 }}>
      <Link href={asPath} locale="th">
        <button disabled={locale === 'th'}>ไทย</button>
      </Link>
      {' | '}
      <Link href={asPath} locale="en">
        <button disabled={locale === 'en'}>English</button>
      </Link>
    </div>
  );
}
