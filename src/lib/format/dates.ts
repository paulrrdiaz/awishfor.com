import type { Locale } from "@/generated/prisma/enums";

const INTL_LOCALE: Record<Locale, string> = {
	es: "es-PE",
	en: "en-US",
};

/** Formats a stored "HH:mm" (24-hour) event time as a locale-appropriate 12-hour clock. */
export function formatEventTime(time: string, locale: Locale): string {
	const [hours, minutes] = time.split(":").map(Number);
	const d = new Date(1970, 0, 1, hours, minutes);
	return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	}).format(d);
}

export function formatEventDate(
	date: Date | string,
	locale: Locale,
	time?: string | null,
): string {
	const d = typeof date === "string" ? new Date(date) : date;
	const formattedDate = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(d);

	return time
		? `${formattedDate} · ${formatEventTime(time, locale)}`
		: formattedDate;
}

export function formatRelativeDate(
	date: Date | string,
	locale: Locale,
): string {
	const d = typeof date === "string" ? new Date(date) : date;
	const now = new Date();
	const diffMs = d.getTime() - now.getTime();
	const diffSeconds = Math.round(diffMs / 1000);
	const diffMinutes = Math.round(diffMs / (1000 * 60));
	const diffHours = Math.round(diffMs / (1000 * 60 * 60));
	const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

	const rtf = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], {
		numeric: "auto",
	});

	if (Math.abs(diffSeconds) < 60) return rtf.format(diffSeconds, "second");
	if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");
	if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
	if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
	if (Math.abs(diffDays) < 365)
		return rtf.format(Math.round(diffDays / 30), "month");
	return rtf.format(Math.round(diffDays / 365), "year");
}
