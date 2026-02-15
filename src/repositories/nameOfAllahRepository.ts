import { MuslimDao } from '../data/database/muslimDao';
import { Language, languageFromLocale } from '../data/models/language';
import { NameOfAllah } from '../data/models/names/nameOfAllah';

/** Repository for accessing the 99 Names of Allah data. */
export class NameOfAllahRepository {
  private static instance: NameOfAllahRepository | null = null;
  private readonly dao: MuslimDao;

  private constructor(dao: MuslimDao) {
    this.dao = dao;
  }

  static getInstance(dao?: MuslimDao): NameOfAllahRepository {
    if (!NameOfAllahRepository.instance) {
      NameOfAllahRepository.instance = new NameOfAllahRepository(
        dao ?? MuslimDao.getInstance(),
      );
    }
    return NameOfAllahRepository.instance;
  }

  /**
   * Get the names of Allah for the specified language.
   * @param language - Language enum value or locale string. Defaults to English.
   */
  getNames(language?: Language | string): NameOfAllah[] {
    try {
      const lang = typeof language === 'string'
        ? languageFromLocale(language)
        : (language ?? Language.en);
      return this.dao.getNames(lang);
    } catch {
      return [];
    }
  }
}
