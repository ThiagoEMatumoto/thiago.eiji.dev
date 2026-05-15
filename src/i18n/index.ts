import pt from './pt.json'
import en from './en.json'

export type Locale = 'pt' | 'en'

export type Translations = typeof pt

const dictionaries: Record<Locale, Translations> = {
  pt,
  en: en as Translations,
}

/**
 * Returns the translations bundle for the given locale.
 * Falls back to PT (default locale) when locale is undefined or unknown.
 */
export function useTranslations(locale: string | undefined): Translations {
  if (locale === 'en') return dictionaries.en
  return dictionaries.pt
}

/**
 * Returns the canonical home path for a given locale.
 * PT (default) lives at "/", EN lives at "/en/".
 */
export function localeHomePath(locale: Locale): string {
  return locale === 'en' ? '/en/' : '/'
}
