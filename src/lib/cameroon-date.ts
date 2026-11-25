export const CAMEROON_TIME_ZONE = "Africa/Douala";
export const FRENCH_LOCALE = "fr-FR";
const DAY_MS = 86_400_000;

export function cameroonDateKey(instant: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: CAMEROON_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function calendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function calendarDateKey(date: Date) { return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`; }
export function addCalendarDays(value: string, amount: number) { return calendarDateKey(new Date(calendarDate(value).getTime() + amount * DAY_MS)); }
export function calendarDayDifference(value: string, reference: string) { return Math.round((calendarDate(value).getTime() - calendarDate(reference).getTime()) / DAY_MS); }
export function mondayOfWeek(value: string) { const date = calendarDate(value); const weekday = date.getUTCDay() || 7; return addCalendarDays(value, 1 - weekday); }
export function sundayOfWeek(value: string) { return addCalendarDays(mondayOfWeek(value), 6); }
export function monthBounds(value: string) { const date = calendarDate(value); return { from: calendarDateKey(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))), to: calendarDateKey(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))) }; }

export type CameroonPeriod = "day" | "week" | "month";
export function cameroonDateTimeToInstant(date: string, time = "00:00:00") {
  const [year, month, day] = date.split("-").map(Number); const [hour, minute, second] = time.split(":").map(Number);
  const nominalUtc = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: CAMEROON_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(new Date(nominalUtc));
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((entry) => entry.type === type)?.value ?? 0);
  const representedAsUtc = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
  return new Date(nominalUtc - (representedAsUtc - nominalUtc));
}
export function cameroonPeriodRange(period: CameroonPeriod, referenceDate: string) {
  const startDate = period === "day" ? referenceDate : period === "week" ? mondayOfWeek(referenceDate) : monthBounds(referenceDate).from;
  const nextDate = period === "day" ? addCalendarDays(startDate, 1) : period === "week" ? addCalendarDays(startDate, 7) : addCalendarDays(monthBounds(referenceDate).to, 1);
  return { start: cameroonDateTimeToInstant(startDate), endExclusive: cameroonDateTimeToInstant(nextDate), startDate, endExclusiveDate: nextDate };
}
export function cameroonCalendarRange(from: string, toInclusive: string) { return { start: cameroonDateTimeToInstant(from), endExclusive: cameroonDateTimeToInstant(addCalendarDays(toInclusive, 1)) }; }
export function taskDueInstant(dueDate: string, dueTime?: string) { return dueTime ? cameroonDateTimeToInstant(dueDate, dueTime) : cameroonDateTimeToInstant(addCalendarDays(dueDate, 1)); }

export function formatCalendarDate(value: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) { return new Intl.DateTimeFormat(FRENCH_LOCALE, { timeZone: "UTC", ...options }).format(calendarDate(value)); }
export function formatCameroonInstant(value: string | Date, options: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "short" }) { return new Intl.DateTimeFormat(FRENCH_LOCALE, { timeZone: CAMEROON_TIME_ZONE, ...options }).format(typeof value === "string" ? new Date(value) : value); }
export function formatRelativeCalendarDate(value: string, today: string) { const difference = calendarDayDifference(value, today); if (difference === 0) return "Aujourd’hui"; if (difference === -1) return "Hier"; if (difference === 1) return "Demain"; return formatCalendarDate(value); }
export function formatCameroonHeaderDate(today: string) { const label = formatCalendarDate(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" }); return label.charAt(0).toUpperCase() + label.slice(1); }
export function millisecondsUntilNextCameroonDay(now: Date = new Date()) { const current = cameroonDateKey(now); let low = now.getTime(); let high = low + 30 * 60 * 60 * 1000; while (high - low > 1_000) { const middle = Math.floor((low + high) / 2); if (cameroonDateKey(new Date(middle)) === current) low = middle; else high = middle; } return Math.max(1_000, high - now.getTime() + 250); }
