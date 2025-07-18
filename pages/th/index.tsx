import { NextSeo } from 'next-seo';
import SEO from '../../next-seo.config';
import { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Home() {
  const t = useTranslations();
  return (
    <main className="p-8">
      <NextSeo {...SEO} title={t('seo_title') || SEO.title} description={t('seo_description') || SEO.description} />
      <LanguageSwitcher />
      <h1 className="text-3xl font-bold">{t('welcome')}</h1>
      <p>{t('description')}</p>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      messages: (await import('../../locales/th/common.json')).default,
      locale: 'th'
    }
  }
}
