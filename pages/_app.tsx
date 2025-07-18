import type { AppProps } from 'next/app';
import { NextIntlProvider } from 'next-intl';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  // ถ้าไม่มี messages ให้แสดงหน้าว่าง (กัน error)
  return (
    <NextIntlProvider
      locale={pageProps.locale}
      messages={pageProps.messages}
      timeZone="Asia/Bangkok"
    >
      <Component {...pageProps} />
    </NextIntlProvider>
  );
}
