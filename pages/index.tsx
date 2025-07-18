import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    // ลอง detect ภาษาเบราว์เซอร์
    const browserLang = (typeof window !== 'undefined' ? navigator.language.split('-')[0] : 'th');
    if (browserLang === 'en') {
      router.replace('/en');
    } else {
      router.replace('/th');
    }
  }, [router]);
  return null;
}
