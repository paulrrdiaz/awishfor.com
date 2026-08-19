import type { Locale } from "@/generated/prisma/enums";

const INTL_LOCALE: Record<Locale, string> = {
	es: "es-PE",
	en: "en-US",
};

/**
 * Normalizes ICU whitespace variants (e.g. U+00A0, U+202F) to a plain space.
 * Node and browsers can ship different ICU versions, which format the same
 * locale string with different space characters (visually identical but
 * byte-different) — this keeps SSR and client output identical and avoids
 * React hydration mismatches.
 */
function normalizeIntlSpaces(value: string): string {
	return value.replace(/[  ]/g, " ");
}

/** Formats a stored "HH:mm" (24-hour) event time as a locale-appropriate 12-hour clock. */
export function formatEventTime(time: string, locale: Locale): string {
	const [hours, minutes] = time.split(":").map(Number);
	const d = new Date(1970, 0, 1, hours, minutes);
	return normalizeIntlSpaces(
		new Intl.DateTimeFormat(INTL_LOCALE[locale], {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		}).format(d),
	);
}

export function formatEventDate(
	date: Date | string,
	locale: Locale,
	time?: string | null,
): string {
	const d = typeof date === "string" ? new Date(date) : date;
	const formattedDate = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		// Event dates are calendar days stored at UTC midnight. Formatting them
		// in the viewer's local timezone can shift the displayed day backwards.
		timeZone: "UTC",
	}).format(d);
	// CLDR places the weekday first for es-PE/en-US, but es-PE returns it
	// lowercase — capitalize index 0 (no-op for en-US). Revisit if a future
	// locale doesn't lead with the weekday.
	const capitalizedDate =
		formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

	return time
		? `${capitalizedDate} · ${formatEventTime(time, locale)}`
		: capitalizedDate;
}

/** Post meta line form, e.g. "14 ago 2026". */
export function formatBlogPostDate(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return normalizeIntlSpaces(
		new Intl.DateTimeFormat("es-PE", {
			day: "numeric",
			month: "short",
			year: "numeric",
			// Frontmatter dates are calendar days; formatting in UTC keeps the
			// displayed day stable regardless of the build or viewer's timezone.
			timeZone: "UTC",
		}).format(d),
	).replace(/\./g, "");
}

/** Index card form, e.g. "14 AGO 2026". */
export function formatBlogIndexDate(date: Date | string): string {
	return formatBlogPostDate(date).toUpperCase();
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
