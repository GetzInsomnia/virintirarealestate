import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { NextIntlProvider } from 'next-intl';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }: AppProps) {
  const { locale, defaultLocale } = useRouter();
  return (
    <NextIntlProvider
      locale={locale}
      messages={pageProps.messages}
      defaultLocale={defaultLocale}
    >
      <Component {...pageProps} />
    </NextIntlProvider>
  );
}
