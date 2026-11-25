import { addCalendarDays, calendarDate, calendarDateKey, calendarDayDifference, formatCalendarDate } from "@/lib/cameroon-date";

export function dateFromOffset(offset: number, referenceDate: string) { return calendarDate(addCalendarDays(referenceDate, offset)); }

export function offsetFromDate(value: string, referenceDate: string) { return calendarDayDifference(value, referenceDate); }

export function isoDate(date: Date) {
  return calendarDateKey(date);
}

export function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() - day + 1);
  return copy;
}

export function addDays(date: Date, amount: number) { return calendarDate(addCalendarDays(calendarDateKey(date), amount)); }

export function sameDay(a: Date, b: Date) {
  return isoDate(a) === isoDate(b);
}

export function formatDay(date: Date, options?: Intl.DateTimeFormatOptions) {
  return formatCalendarDate(calendarDateKey(date), options);
}

export function offsetFromCalendarDate(date: Date, referenceDate: string) { return calendarDayDifference(calendarDateKey(date), referenceDate); }

export function monthGrid(date: Date) {
  const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

