/** Prayer time model holding all prayer times as Date objects. */
export interface PrayerTime {
  readonly fajr: Date;
  readonly sunrise: Date;
  readonly dhuhr: Date;
  readonly asr: Date;
  readonly maghrib: Date;
  readonly isha: Date;
}

/** Creates a copy of PrayerTime with optional overrides. */
export function copyPrayerTime(
  prayer: PrayerTime,
  overrides?: Partial<PrayerTime>,
): PrayerTime {
  return {
    fajr: overrides?.fajr ?? prayer.fajr,
    sunrise: overrides?.sunrise ?? prayer.sunrise,
    dhuhr: overrides?.dhuhr ?? prayer.dhuhr,
    asr: overrides?.asr ?? prayer.asr,
    maghrib: overrides?.maghrib ?? prayer.maghrib,
    isha: overrides?.isha ?? prayer.isha,
  };
}

/**
 * Returns the prayer time at the given index.
 * Order: [fajr, sunrise, dhuhr, asr, maghrib, isha]
 * If index is negative, returns isha.
 */
export function prayerTimeAtIndex(prayer: PrayerTime, index: number): Date {
  const prayers = [prayer.fajr, prayer.sunrise, prayer.dhuhr, prayer.asr, prayer.maghrib, prayer.isha];
  if (index < 0) {
    return prayers[5];
  }
  return prayers[index];
}
