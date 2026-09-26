const LIMA_TIME_ZONE = "America/Lima";
const millisecondsPerDay = 24 * 60 * 60 * 1000;

function calendarDateInLima(now: Date): string {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: LIMA_TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(now);
	const value = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((part) => part.type === type)?.value;
	return `${value("year")}-${value("month")}-${value("day")}`;
}

function storedCalendarDate(value: string): string {
	return value.slice(0, 10);
}

function calendarDateToUtcMillis(value: string): number {
	const [year, month, day] = value.split("-").map(Number);
	return Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 0);
}

export function calendarDaysUntil(eventDate: string, now: Date): number {
	return Math.round(
		(calendarDateToUtcMillis(storedCalendarDate(eventDate)) -
			calendarDateToUtcMillis(calendarDateInLima(now))) /
			millisecondsPerDay,
	);
}
