import { addCalendarDays, calendarDayDifference, formatCameroonHeaderDate, formatRelativeCalendarDate } from "@/lib/cameroon-date";
export function formatTaskDate(date: string, referenceDate: string) { return formatRelativeCalendarDate(date, referenceDate); }
export function taskOffsetToInputDate(offset: number, referenceDate: string) { return addCalendarDays(referenceDate, offset); }
export function inputDateToTaskOffset(value: string, referenceDate: string) { return value ? calendarDayDifference(value, referenceDate) : 0; }
export function currentDateLabel(referenceDate: string) { return formatCameroonHeaderDate(referenceDate); }
