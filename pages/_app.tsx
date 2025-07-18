import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { IntlProvider } from 'next-intl';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }: AppProps) {
  const { locale } = useRouter();
  return (
    <IntlProvider
      locale={locale!}
      messages={pageProps.messages}
    >
      <Component {...pageProps} />
    </IntlProvider>
  );
}
