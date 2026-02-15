import { timeStringToDate } from '../../../utils/stringDate';
import { Location } from '../location/location';
import { CalculationMethod, getMethodParams } from './calculationMethod';
import { HigherLatitudeMethod } from './higherLatitudeMethod';
import { PrayerAttribute } from './prayerAttribute';
import { PrayerTime } from './prayerTime';

/**
 * Calculates prayer times based on astronomical formulas.
 * Ported from the Flutter muslim_data_flutter package.
 */
export class CalculatedPrayerTime {
  private readonly attribute: PrayerAttribute;
  private readonly methodParams: Record<CalculationMethod, number[]>;

  // Global variables
  private lat: number = 0.0;
  private lng: number = 0.0;
  private timeZone: number = 0.0;
  private jDate: number = 0.0;
  private readonly invalidTime: string = '-----';
  private readonly numIterations: number = 1;

  constructor(attribute: PrayerAttribute) {
    this.attribute = attribute;
    this.methodParams = getMethodParams(attribute.customMethod);
  }

  // ── Trigonometric Functions ──

  private fixAngle(a: number): number {
    a -= 360 * Math.floor(a / 360.0);
    return a < 0 ? a + 360 : a;
  }

  private fixHour(a: number): number {
    a -= 24.0 * Math.floor(a / 24.0);
    return a < 0 ? a + 24 : a;
  }

  private radiansToDegrees(alpha: number): number {
    return (alpha * 180.0) / Math.PI;
  }

  private degreesToRadians(alpha: number): number {
    return (alpha * Math.PI) / 180.0;
  }

  private dSin(d: number): number {
    return Math.sin(this.degreesToRadians(d));
  }

  private dCos(d: number): number {
    return Math.cos(this.degreesToRadians(d));
  }

  private dTan(d: number): number {
    return Math.tan(this.degreesToRadians(d));
  }

  private dArcSin(x: number): number {
    return this.radiansToDegrees(Math.asin(x));
  }

  private dArcCos(x: number): number {
    return this.radiansToDegrees(Math.acos(x));
  }

  private dArcTan2(y: number, x: number): number {
    return this.radiansToDegrees(Math.atan2(y, x));
  }

  private dArcCot(x: number): number {
    return this.radiansToDegrees(Math.atan2(1.0, x));
  }

  // ── Julian Date Functions ──

  private julianDate(year: number, month: number, day: number): number {
    let y = year;
    let m = month;
    if (m <= 2) {
      y -= 1;
      m += 12;
    }
    const a = Math.floor(y / 100.0);
    const b = 2 - a + Math.floor(a / 4.0);
    return (
      Math.floor(365.25 * (y + 4716)) +
      Math.floor(30.6001 * (m + 1)) +
      day +
      b -
      1524.5
    );
  }

  // ── Calculation Functions ──

  private sunPosition(jd: number): [number, number] {
    const d1 = jd - 2451545;
    const g = this.fixAngle(357.529 + 0.98560028 * d1);
    const q = this.fixAngle(280.459 + 0.98564736 * d1);
    const l = this.fixAngle(q + 1.915 * this.dSin(g) + 0.020 * this.dSin(2 * g));

    const e = 23.439 - 0.00000036 * d1;
    const d2 = this.dArcSin(this.dSin(e) * this.dSin(l));
    let ra = this.dArcTan2(this.dCos(e) * this.dSin(l), this.dCos(l)) / 15.0;
    ra = this.fixHour(ra);
    const eqt = q / 15.0 - ra;
    return [d2, eqt];
  }

  private equationOfTime(jd: number): number {
    return this.sunPosition(jd)[1];
  }

  private sunDeclination(jd: number): number {
    return this.sunPosition(jd)[0];
  }

  private computeMidDay(t: number): number {
    const eqt = this.equationOfTime(this.jDate + t);
    return this.fixHour(12 - eqt);
  }

  private computeTime(G: number, t: number): number {
    const d = this.sunDeclination(this.jDate + t);
    const z = this.computeMidDay(t);
    const beg = -this.dSin(G) - this.dSin(d) * this.dSin(this.lat);
    const mid = this.dCos(d) * this.dCos(this.lat);
    const v = this.dArcCos(beg / mid) / 15.0;
    return z + (G > 90 ? -v : v);
  }

  private computeAsr(step: number, t: number): number {
    const d = this.sunDeclination(this.jDate + t);
    const g = -this.dArcCot(step + this.dTan(Math.abs(this.lat - d)));
    return this.computeTime(g, t);
  }

  private timeDiff(time1: number, time2: number): number {
    return this.fixHour(time2 - time1);
  }

  // ── Interface Functions ──

  getPrayerTimes(
    location: Location,
    date: Date,
    timezone?: number,
  ): PrayerTime | null {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    this.timeZone = timezone ?? -date.getTimezoneOffset() / 60.0;

    this.lat = location.latitude;
    this.lng = location.longitude;
    this.jDate = this.julianDate(year, month, day);
    const lonDiff = location.longitude / (15.0 * 24.0);
    this.jDate -= lonDiff;

    try {
      const cTime = this.computeDayTimes();
      return {
        fajr: timeStringToDate(cTime[0], date),
        sunrise: timeStringToDate(cTime[1], date),
        dhuhr: timeStringToDate(cTime[2], date),
        asr: timeStringToDate(cTime[3], date),
        maghrib: timeStringToDate(cTime[4], date),
        isha: timeStringToDate(cTime[5], date),
      };
    } catch {
      return null;
    }
  }

  private floatToTime24(time: number): string {
    if (isNaN(time)) return this.invalidTime;

    const fixedTime = this.fixHour(time + 0.5 / 60.0);
    const hours = Math.floor(fixedTime);
    const minutes = Math.floor((fixedTime - hours) * 60.0);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  private computeTimes(times: number[]): number[] {
    const t = this.dayPortion(times);
    const params = this.methodParams[this.attribute.calculationMethod];

    const fajr = this.computeTime(180 - params[0], t[0]);
    const sunrise = this.computeTime(180 - 0.833, t[1]);
    const dhuhr = this.computeMidDay(t[2]);
    const asr = this.computeAsr(1 + this.attribute.asrMethod, t[3]);
    const sunset = this.computeTime(0.833, t[4]);
    const maghrib = this.computeTime(params[2], t[5]);
    const isha = this.computeTime(params[4], t[6]);

    return [fajr, sunrise, dhuhr, asr, sunset, maghrib, isha];
  }

  private computeDayTimes(): string[] {
    let times = [5.0, 6.0, 12.0, 13.0, 18.0, 18.0, 18.0];
    for (let i = 0; i < this.numIterations; i++) {
      times = this.computeTimes(times);
    }
    times = this.adjustTimes(times);
    return this.adjustTimesFormat(times);
  }

  private adjustTimes(times: number[]): number[] {
    const params = this.methodParams[this.attribute.calculationMethod];

    for (let i = 0; i < times.length; i++) {
      times[i] += this.timeZone - this.lng / 15;
    }
    if (params[1] === 1.0) {
      times[5] = times[4] + params[2] / 60;
    }
    if (params[3] === 1.0) {
      times[6] = times[5] + params[4] / 60;
    }
    if (this.attribute.higherLatitudeMethod !== HigherLatitudeMethod.none) {
      times = this.adjustHighLatTimes(times);
    }
    return times;
  }

  private adjustTimesFormat(times: number[]): string[] {
    const result = times.map((t) => this.floatToTime24(t));
    result.splice(4, 1); // Remove sunset
    return result;
  }

  private adjustHighLatTimes(times: number[]): number[] {
    const params = this.methodParams[this.attribute.calculationMethod];
    const nightTime = this.timeDiff(times[4], times[1]);

    const fajrDiff = this.nightPortion(params[0]) * nightTime;
    if (isNaN(times[0]) || this.timeDiff(times[0], times[1]) > fajrDiff) {
      times[0] = times[1] - fajrDiff;
    }

    const ishaAngle = params[3] === 0.0 ? params[4] : 18.0;
    const ishaDiff = this.nightPortion(ishaAngle) * nightTime;
    if (isNaN(times[6]) || this.timeDiff(times[4], times[6]) > ishaDiff) {
      times[6] = times[4] + ishaDiff;
    }

    const maghribAngle = params[1] === 0.0 ? params[2] : 4.0;
    const maghribDiff = this.nightPortion(maghribAngle) * nightTime;
    if (isNaN(times[5]) || this.timeDiff(times[4], times[5]) > maghribDiff) {
      times[5] = times[4] + maghribDiff;
    }

    return times;
  }

  private nightPortion(angle: number): number {
    switch (this.attribute.higherLatitudeMethod) {
      case HigherLatitudeMethod.angleBased:
        return angle / 60.0;
      case HigherLatitudeMethod.midNight:
        return 0.5;
      default: // HigherLatitudeMethod.oneSeven
        return 0.14286;
    }
  }

  private dayPortion(times: number[]): number[] {
    return times.map((time) => time / 24.0);
  }
}
