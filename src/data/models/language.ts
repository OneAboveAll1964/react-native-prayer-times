/** Languages available for muslim data. */
export enum Language {
  en = 'en',
  ar = 'ar',
  ckb = 'ckb',
  ckbBadini = 'ckb_Badini',
  fa = 'fa',
  ru = 'ru',
}

/** List of supported language codes. */
export const supportedLanguages: Language[] = Object.values(Language);

/**
 * Returns the corresponding Language for the given locale string.
 *
 * Matching priority:
 * 1. Exact match (e.g. 'ckb_Badini')
 * 2. Language code match only (e.g. 'ckb' matches Language.ckb)
 * 3. English as default
 */
export function languageFromLocale(locale?: string | null): Language {
  const defaultLanguage = Language.en;

  if (!locale) {
    return defaultLanguage;
  }

  // Exact match
  const exactMatch = Object.values(Language).find((lang) => lang === locale);
  if (exactMatch) {
    return exactMatch;
  }

  // Language code match (prefix before '_')
  const langCode = locale.split('_')[0].split('-')[0];
  const codeMatch = Object.values(Language).find(
    (lang) => lang.split('_')[0] === langCode,
  );
  if (codeMatch) {
    return codeMatch;
  }

  return defaultLanguage;
}

/**
 * Convert a Language enum value to its database locale code.
 * This is used in SQL queries.
 */
export function languageToCode(language: Language): string {
  return language;
}
