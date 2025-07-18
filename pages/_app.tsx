// pages/_app.tsx
import type { AppProps } from 'next/app'
import { NextIntlProvider } from 'next-intl'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  // auto detect locale จาก pathname
  const { locale = 'th', messages } = pageProps

  return (
    <NextIntlProvider locale={locale} messages={messages}>
      <Component {...pageProps} />
    </NextIntlProvider>
  )
}
export default MyApp
