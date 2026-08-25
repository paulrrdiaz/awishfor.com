export const CALENDAR_TIMEZONE = "America/Lima";

export type CalendarEventInput = {
	title: string;
	eventDate: string;
	eventTime?: string | null;
	endTime?: string | null;
	location?: string | null;
	description?: string | null;
	inviteUrl: string;
};

export type CalendarEvent = {
	googleCalendarUrl: string;
	icalendar: string;
	filename: string;
};

type CalendarDay = {
	year: number;
	month: number;
	day: number;
};

function calendarDay(value: string): CalendarDay {
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
	if (!match) {
		throw new Error("Calendar events require an ISO calendar date.");
	}

	const [, yearText = "", monthText = "", dayText = ""] = match;
	const year = Number(yearText);
	const month = Number(monthText);
	const day = Number(dayText);
	const normalized = new Date(Date.UTC(year, month - 1, day));
	if (
		normalized.getUTCFullYear() !== year ||
		normalized.getUTCMonth() !== month - 1 ||
		normalized.getUTCDate() !== day
	) {
		throw new Error("Calendar events require a valid calendar date.");
	}

	return { year, month, day };
}

function calendarTime(value: string): { hours: number; minutes: number } {
	const match = /^(\d{2}):(\d{2})$/.exec(value);
	if (!match) throw new Error("Calendar events require an HH:mm time.");
	const [, hoursText = "", minutesText = ""] = match;
	const hours = Number(hoursText);
	const minutes = Number(minutesText);
	if (hours > 23 || minutes > 59) {
		throw new Error("Calendar events require a valid HH:mm time.");
	}
	return { hours, minutes };
}

function addDays(day: CalendarDay, amount: number): CalendarDay {
	const result = new Date(Date.UTC(day.year, day.month - 1, day.day + amount));
	return {
		year: result.getUTCFullYear(),
		month: result.getUTCMonth() + 1,
		day: result.getUTCDate(),
	};
}

function addHour(day: CalendarDay, time: { hours: number; minutes: number }) {
	const result = new Date(
		Date.UTC(day.year, day.month - 1, day.day, time.hours + 1, time.minutes),
	);
	return {
		day: {
			year: result.getUTCFullYear(),
			month: result.getUTCMonth() + 1,
			day: result.getUTCDate(),
		},
		time: { hours: result.getUTCHours(), minutes: result.getUTCMinutes() },
	};
}

function dateStamp(day: CalendarDay): string {
	return `${day.year}${String(day.month).padStart(2, "0")}${String(day.day).padStart(2, "0")}`;
}

function dateTimeStamp(
	day: CalendarDay,
	time: { hours: number; minutes: number },
): string {
	return `${dateStamp(day)}T${String(time.hours).padStart(2, "0")}${String(time.minutes).padStart(2, "0")}00`;
}

function escapeIcalendarText(value: string): string {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/\r\n|\r|\n/g, "\\n")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,");
}

function filenameFor(title: string, day: CalendarDay): string {
	const slug = title
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "")
		.slice(0, 60);
	return `${slug || "evento"}-${dateStamp(day)}.ics`;
}

function displayAlarm(trigger: string, description: string): string[] {
	return [
		"BEGIN:VALARM",
		`TRIGGER:${trigger}`,
		"ACTION:DISPLAY",
		`DESCRIPTION:${escapeIcalendarText(description)}`,
		"END:VALARM",
	];
}

/**
 * Produces portable calendar actions from wishlist event data. Event days are
 * intentionally parsed as calendar days rather than browser-local timestamps.
 */
export function createCalendarEvent(input: CalendarEventInput): CalendarEvent {
	const day = calendarDay(input.eventDate);
	const location = input.location?.trim() || undefined;
	const start = input.eventTime ? calendarTime(input.eventTime) : undefined;
	const suppliedEnd = input.endTime ? calendarTime(input.endTime) : undefined;
	const end = start
		? suppliedEnd
			? { day, time: suppliedEnd }
			: addHour(day, start)
		: undefined;
	const allDayEnd = addDays(day, 1);
	const details = [input.description?.trim(), `Invitación: ${input.inviteUrl}`]
		.filter((value): value is string => Boolean(value))
		.join("\n\n");

	const google = new URL("https://calendar.google.com/calendar/render");
	google.searchParams.set("action", "TEMPLATE");
	google.searchParams.set("text", input.title);
	google.searchParams.set(
		"dates",
		start && end
			? `${dateTimeStamp(day, start)}/${dateTimeStamp(end.day, end.time)}`
			: `${dateStamp(day)}/${dateStamp(allDayEnd)}`,
	);
	google.searchParams.set("details", details);
	if (location) google.searchParams.set("location", location);
	if (start) google.searchParams.set("ctz", CALENDAR_TIMEZONE);

	const icalendarLines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//A Wish For//Calendar Save//ES",
		"CALSCALE:GREGORIAN",
		"BEGIN:VEVENT",
		`UID:awishfor-${dateStamp(day)}-${filenameFor(input.title, day).replace(/\.ics$/, "")}@awishfor.com`,
		start && end
			? `DTSTART;TZID=${CALENDAR_TIMEZONE}:${dateTimeStamp(day, start)}`
			: `DTSTART;VALUE=DATE:${dateStamp(day)}`,
		start && end
			? `DTEND;TZID=${CALENDAR_TIMEZONE}:${dateTimeStamp(end.day, end.time)}`
			: `DTEND;VALUE=DATE:${dateStamp(allDayEnd)}`,
		`SUMMARY:${escapeIcalendarText(input.title)}`,
		`DESCRIPTION:${escapeIcalendarText(details)}`,
		...(location ? [`LOCATION:${escapeIcalendarText(location)}`] : []),
		...displayAlarm("-P1W", input.title),
		...displayAlarm("-P1D", input.title),
		...displayAlarm("-PT3H", input.title),
		"END:VEVENT",
		"END:VCALENDAR",
	];

	return {
		googleCalendarUrl: google.toString(),
		icalendar: `${icalendarLines.join("\r\n")}\r\n`,
		filename: filenameFor(input.title, day),
	};
}
