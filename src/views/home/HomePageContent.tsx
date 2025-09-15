import LanguageSwitcher from '../../../components/LanguageSwitcher'
import CurrencySwitcher from '../../components/CurrencySwitcher'
import PropertyPrice from '../../components/PropertyPrice'
import { useTranslation } from 'next-i18next'

interface Props {
  keywords: string[]
}

export default function HomePageContent({ keywords }: Props) {
  const { t } = useTranslation('common')
  return (
    <>
      <LanguageSwitcher />
      <CurrencySwitcher />
      <PropertyPrice priceTHB={1000000} />
      <h1>{t('welcome')}</h1>
      <p>{keywords.join(', ')}</p>
    </>
  )
}
