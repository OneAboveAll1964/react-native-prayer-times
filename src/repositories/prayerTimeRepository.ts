import { MuslimDao } from '../data/database/muslimDao';
import { CalculatedPrayerTime } from '../data/models/prayerTimes/calculatedPrayerTime';
import { PrayerAttribute } from '../data/models/prayerTimes/prayerAttribute';
import { PrayerTime, copyPrayerTime } from '../data/models/prayerTimes/prayerTime';
import { Location } from '../data/models/location/location';

/** Repository for accessing prayer time data. */
export class PrayerTimeRepository {
  private static instance: PrayerTimeRepository | null = null;
  private readonly dao: MuslimDao;

  private constructor(dao: MuslimDao) {
    this.dao = dao;
  }

  static getInstance(dao?: MuslimDao): PrayerTimeRepository {
    if (!PrayerTimeRepository.instance) {
      PrayerTimeRepository.instance = new PrayerTimeRepository(
        dao ?? MuslimDao.getInstance(),
      );
    }
    return PrayerTimeRepository.instance;
  }

  /**
   * Get prayer times for the specified location, date, and attribute.
   *
   * @param location - The location to get prayer times for.
   * @param date - The date to get prayer times for.
   * @param attribute - Prayer calculation attributes.
   * @param useFixedPrayer - Whether to use fixed prayer times if available (default: true).
   */
  getPrayerTimes(params: {
    location: Location;
    date: Date;
    attribute: PrayerAttribute;
    useFixedPrayer?: boolean;
  }): PrayerTime | null {
    const { location, date, attribute, useFixedPrayer = true } = params;

    try {
      let prayerTime: PrayerTime | null;

      if (location.hasFixedPrayerTime && useFixedPrayer) {
        const fixedPrayer = this.dao.getPrayerTimes(
          location.prayerDependentId ?? location.id,
          date,
        );
        if (!fixedPrayer) return null;

        prayerTime = this.adjustDST(fixedPrayer);
      } else {
        prayerTime = new CalculatedPrayerTime(attribute).getPrayerTimes(
          location,
          date,
        );
      }

      if (!prayerTime) return null;

      prayerTime = this.applyOffset(prayerTime, attribute.offset);
      return prayerTime;
    } catch {
      return null;
    }
  }

  /** Applies the given list of offsets (in minutes) to the prayer times. */
  private applyOffset(
    prayer: PrayerTime,
    offsets: readonly [number, number, number, number, number, number],
  ): PrayerTime {
    return copyPrayerTime(prayer, {
      fajr: addMinutes(prayer.fajr, offsets[0]),
      sunrise: addMinutes(prayer.sunrise, offsets[1]),
      dhuhr: addMinutes(prayer.dhuhr, offsets[2]),
      asr: addMinutes(prayer.asr, offsets[3]),
      maghrib: addMinutes(prayer.maghrib, offsets[4]),
      isha: addMinutes(prayer.isha, offsets[5]),
    });
  }

  /** Adjusts the prayer times for Daylight Saving Time (DST). */
  private adjustDST(prayer: PrayerTime): PrayerTime {
    if (this.isDst()) {
      return copyPrayerTime(prayer, {
        fajr: addMinutes(prayer.fajr, 60),
        sunrise: addMinutes(prayer.sunrise, 60),
        dhuhr: addMinutes(prayer.dhuhr, 60),
        asr: addMinutes(prayer.asr, 60),
        maghrib: addMinutes(prayer.maghrib, 60),
        isha: addMinutes(prayer.isha, 60),
      });
    }
    return prayer;
  }

  /** Determines whether Daylight Saving Time (DST) is active. */
  private isDst(): boolean {
    const now = new Date();

    // Determine the standard time offset by comparing offsets in winter and summer
    const january = new Date(now.getFullYear(), 0, 15);
    const july = new Date(now.getFullYear(), 6, 15);

    const januaryOffset = january.getTimezoneOffset();
    const julyOffset = july.getTimezoneOffset();

    // The larger getTimezoneOffset value is the standard offset (non-DST)
    // (getTimezoneOffset is inverted: more negative = further ahead of UTC)
    const standardOffset = Math.max(januaryOffset, julyOffset);

    // DST is active if the current offset is less than the standard offset
    return now.getTimezoneOffset() < standardOffset;
  }
}

/** Helper: add minutes to a Date. */
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}
