import { MuslimDao } from '../data/database/muslimDao';
import { Language, languageFromLocale } from '../data/models/language';
import { AzkarCategory } from '../data/models/azkars/azkarCategory';
import { AzkarChapter } from '../data/models/azkars/azkarChapter';
import { AzkarItem } from '../data/models/azkars/azkarItem';

/** Repository for accessing Hisnul Muslim azkars. */
export class HisnulMuslimRepository {
  private static instance: HisnulMuslimRepository | null = null;
  private readonly dao: MuslimDao;

  private constructor(dao: MuslimDao) {
    this.dao = dao;
  }

  static getInstance(dao?: MuslimDao): HisnulMuslimRepository {
    if (!HisnulMuslimRepository.instance) {
      HisnulMuslimRepository.instance = new HisnulMuslimRepository(
        dao ?? MuslimDao.getInstance(),
      );
    }
    return HisnulMuslimRepository.instance;
  }

  /** Resolve a Language enum from either a Language value or a locale string. */
  private resolveLang(language?: Language | string): Language {
    if (!language) return Language.en;
    return typeof language === 'string' ? languageFromLocale(language) : language;
  }

  /** Get azkar categories for the specified language. */
  getAzkarCategories(language?: Language | string): AzkarCategory[] {
    try {
      return this.dao.getAzkarCategories(this.resolveLang(language));
    } catch {
      return [];
    }
  }

  /**
   * Get azkar chapters for the specified language and categoryId.
   * If categoryId is 1 (default), all chapters are returned.
   */
  getAzkarChapters(params?: {
    language?: Language | string;
    categoryId?: number;
  }): AzkarChapter[] {
    try {
      return this.dao.getAzkarChapters(
        this.resolveLang(params?.language),
        params?.categoryId ?? 1,
      );
    } catch {
      return [];
    }
  }

  /** Get azkar chapters by specific chapter IDs. */
  getAzkarChaptersByIds(params: {
    language?: Language | string;
    chapterIds: number[];
  }): AzkarChapter[] {
    try {
      return this.dao.getAzkarChaptersByIds(
        this.resolveLang(params.language),
        params.chapterIds,
      );
    } catch {
      return [];
    }
  }

  /** Search azkar chapters for the specified language and query string. */
  searchAzkarChapters(params: {
    language?: Language | string;
    query: string;
  }): AzkarChapter[] {
    try {
      return this.dao.searchAzkarChapters(
        this.resolveLang(params.language),
        params.query.trim(),
      );
    } catch {
      return [];
    }
  }

  /** Get azkar items for the specified chapter and language. */
  getAzkarItems(params: {
    language?: Language | string;
    chapterId: number;
  }): AzkarItem[] {
    try {
      return this.dao.getAzkarItems(
        this.resolveLang(params.language),
        params.chapterId,
      );
    } catch {
      return [];
    }
  }
}
