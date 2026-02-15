/**
 * Convert a database time string (HH:mm) to a Date object
 * using the given date's year, month, and day.
 */
export function timeStringToDate(timeStr: string, date: Date): Date {
  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute);
}
