import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { IntlProvider } from 'next-intl'
import { useRouter } from 'next/router'

export default function MyApp({ Component, pageProps }: AppProps) {
  const { locale = 'th' } = useRouter();
  const font = locale === 'th' ? 'Prompt' : 'Inter'
  return (
    <IntlProvider locale={locale} messages={pageProps.messages}>
      <div style={{ fontFamily: `'${font}', 'Inter', 'Prompt', sans-serif` }}>
        <Component {...pageProps} />
      </div>
    </IntlProvider>
  )
}
