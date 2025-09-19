import type { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { parseCookies } from '@/lib/http/cookies'
import {
  CONSOLE_LOCALE_COOKIE,
  type ConsoleUserSession,
  getConsoleUserFromCookies,
} from '@/lib/auth/consoleSession'
import { getLanguageAlternates, getSeoUrls } from '@/lib/seo'
import type { ConsolePageBaseProps, ConsoleHeadProps } from './types'

interface ConsoleGuardOptions {
  seoPath: string
  seoTitle: string
}

interface ConsoleGuardSuccess extends ConsolePageBaseProps {}

function buildHead(locale: string, path: string, title: string): ConsoleHeadProps {
  const { pageUrl } = getSeoUrls(locale, path)
  return {
    seo: {
      title,
      canonical: pageUrl,
      languageAlternates: getLanguageAlternates(path),
    },
  }
}

function resolvePreferredLocale(
  user: ConsoleUserSession,
  cookies: Record<string, string>,
  fallback: string,
): string {
  return user.localePreference || cookies[CONSOLE_LOCALE_COOKIE] || fallback
}

function stripLeadingLocale(path: string): string {
  return path.replace(/^\/[^/]+/, '')
}

export function createConsoleGetServerSideProps<
  P extends Record<string, unknown> = Record<string, never>,
>(
  options: ConsoleGuardOptions,
  extend?: (
    ctx: GetServerSidePropsContext,
    base: ConsoleGuardSuccess,
  ) => Promise<P> | P,
): GetServerSideProps<ConsoleGuardSuccess & P> {
  return async (ctx) => {
    const { req, resolvedUrl, locale, defaultLocale } = ctx
    const activeLocale = locale || defaultLocale || 'th'
    const cookies = parseCookies(req.headers.cookie)
    const user = getConsoleUserFromCookies(cookies)

    if (!user) {
      const destination = `/${activeLocale}/?console=signin`
      return { redirect: { destination, permanent: false } }
    }

    const preferredLocale = resolvePreferredLocale(user, cookies, activeLocale)
    if (preferredLocale !== activeLocale) {
      const pathSuffix = stripLeadingLocale(resolvedUrl)
      return {
        redirect: {
          destination: `/${preferredLocale}${pathSuffix}`,
          permanent: false,
        },
      }
    }

    const head = buildHead(activeLocale, options.seoPath, options.seoTitle)

    const baseProps: ConsoleGuardSuccess = {
      locale: activeLocale,
      user: {
        ...user,
        localePreference: preferredLocale,
      },
      head,
    }

    if (!extend) {
      return { props: baseProps as ConsoleGuardSuccess & P }
    }

    const extra = await extend(ctx, baseProps)
    return {
      props: { ...baseProps, ...extra },
    }
  }
}
