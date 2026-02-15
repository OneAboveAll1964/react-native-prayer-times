import { MuslimDb, DbRow } from './muslimDb';
import { RowQuery } from './rowQuery';
import { Language } from '../models/language';
import { Location, createLocation } from '../models/location/location';
import { NameOfAllah } from '../models/names/nameOfAllah';
import { AzkarCategory } from '../models/azkars/azkarCategory';
import { AzkarChapter } from '../models/azkars/azkarChapter';
import { AzkarItem } from '../models/azkars/azkarItem';
import { PrayerTime } from '../models/prayerTimes/prayerTime';
import { toDbDate } from '../../utils/dateUtils';
import { timeStringToDate } from '../../utils/stringDate';

/**
 * Data Access Object responsible for all database operations.
 */
export class MuslimDao {
  private static instance: MuslimDao | null = null;
  private readonly db: MuslimDb;

  private constructor(db: MuslimDb) {
    this.db = db;
  }

  /** Get or create the singleton instance. */
  static getInstance(db?: MuslimDb): MuslimDao {
    if (!MuslimDao.instance) {
      const database = db ?? MuslimDb.getInstance();
      MuslimDao.instance = new MuslimDao(database);
    }
    return MuslimDao.instance;
  }

  // ── Location Queries ──

  /** Search for locations in the database by the given locationName. */
  searchLocations(locationName: string): Location[] {
    const rows = this.db.query(RowQuery.searchLocationsQuery(locationName));
    return rows.map(rowToLocation);
  }

  /** Get the location by the given countryCode and locationName. */
  geocoder(countryCode: string, locationName: string): Location | null {
    const row = this.db.querySingle(RowQuery.geocoderQuery(countryCode, locationName));
    return row ? rowToLocation(row) : null;
  }

  /** Get the location by the given latitude and longitude. */
  reverseGeocoder(latitude: number, longitude: number): Location | null {
    const row = this.db.querySingle(RowQuery.reverseGeocoderQuery(latitude, longitude));
    return row ? rowToLocation(row) : null;
  }

  /** Get the list of locations with fixed prayer times. */
  getFixedPrayerTimesList(): Location[] {
    const rows = this.db.query(RowQuery.fixedPrayerTimesListQuery());
    return rows.map(rowToLocation);
  }

  // ── Prayer Time Queries ──

  /** Get prayer times for the specified location and date. */
  getPrayerTimes(locationId: number, date: Date): PrayerTime | null {
    const row = this.db.querySingle(RowQuery.prayerTimesQuery(locationId, toDbDate(date)));
    if (!row) return null;

    return {
      fajr: timeStringToDate(row['fajr'] as string, date),
      sunrise: timeStringToDate(row['sunrise'] as string, date),
      dhuhr: timeStringToDate(row['dhuhr'] as string, date),
      asr: timeStringToDate(row['asr'] as string, date),
      maghrib: timeStringToDate(row['maghrib'] as string, date),
      isha: timeStringToDate(row['isha'] as string, date),
    };
  }

  // ── Names of Allah Queries ──

  /** Get the names of Allah for the specified language. */
  getNames(language: Language): NameOfAllah[] {
    const rows = this.db.query(RowQuery.namesQuery(language));
    return rows.map((row): NameOfAllah => ({
      id: row['id'] as number,
      name: row['name'] as string,
      translation: row['translation'] as string,
      transliteration: row['transliteration'] as string,
    }));
  }

  // ── Azkar Queries ──

  /** Get the azkar categories for the specified language. */
  getAzkarCategories(language: Language): AzkarCategory[] {
    const rows = this.db.query(RowQuery.azkarCategoriesQuery(language));
    return rows.map((row): AzkarCategory => ({
      id: row['categoryId'] as number,
      name: row['categoryName'] as string,
    }));
  }

  /** Get the azkar chapters for the specified language and categoryId. */
  getAzkarChapters(language: Language, categoryId: number): AzkarChapter[] {
    const rows = this.db.query(RowQuery.azkarChaptersQuery(language, categoryId));
    return rows.map(rowToAzkarChapter);
  }

  /** Get the azkar chapters for the specified language and chapterIds. */
  getAzkarChaptersByIds(language: Language, chapterIds: number[]): AzkarChapter[] {
    const rows = this.db.query(RowQuery.azkarChaptersQueryByIds(language, chapterIds));
    return rows.map(rowToAzkarChapter);
  }

  /** Search azkar chapters for the specified language and query string. */
  searchAzkarChapters(language: Language, query: string): AzkarChapter[] {
    const rows = this.db.query(RowQuery.searchAzkarChaptersQuery(language, query));
    return rows.map(rowToAzkarChapter);
  }

  /** Get the azkar items for the specified language and chapterId. */
  getAzkarItems(language: Language, chapterId: number): AzkarItem[] {
    const rows = this.db.query(RowQuery.azkarItemsQuery(language, chapterId));
    return rows.map((row): AzkarItem => ({
      id: row['itemId'] as number,
      chapterId: row['chapterId'] as number,
      item: (row['item'] as string) ?? null,
      transliteration: (row['transliteration'] as string) ?? null,
      count: (row['count'] as number) ?? null,
      topNote: (row['topNote'] as string) ?? null,
      bottomNote: (row['bottomNote'] as string) ?? null,
      translation: (row['translation'] as string) ?? null,
      reference: row['reference'] as string,
    }));
  }
}

// ── Row Mappers ──

function rowToLocation(row: DbRow): Location {
  return createLocation({
    id: row['id'] as number,
    name: row['name'] as string,
    latitude: row['latitude'] as number,
    longitude: row['longitude'] as number,
    countryCode: row['countryCode'] as string,
    countryName: row['countryName'] as string,
    hasFixedPrayerTime: Boolean(row['hasFixedPrayerTime']),
    prayerDependentId: (row['prayerDependentId'] as number) ?? null,
  });
}

function rowToAzkarChapter(row: DbRow): AzkarChapter {
  return {
    id: row['chapterId'] as number,
    categoryId: row['categoryId'] as number,
    categoryName: row['categoryName'] as string,
    name: row['chapterName'] as string,
  };
}
