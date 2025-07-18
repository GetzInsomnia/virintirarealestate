// pages/en/index.tsx
import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations()
  return <h1>{t('welcome')}</h1>
}

export async function getStaticProps() {
  const messages = (await import('../../locales/en/common.json')).default
  return { props: { messages, locale: 'en' } }
}
