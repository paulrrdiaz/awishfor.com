/**
 * `eventDate`/`rsvpDeadline` are stored as UTC midnight for a calendar day
 * (see `toDraftDate`), not a specific moment — comparing against that literal
 * instant would close RSVPs ~21 hours early in any timezone west of UTC.
 * The cutoff is the end of that calendar day (UTC) instead.
 */
function endOfUtcDay(iso: string): Date {
	const d = new Date(iso);
	return new Date(
		Date.UTC(
			d.getUTCFullYear(),
			d.getUTCMonth(),
			d.getUTCDate(),
			23,
			59,
			59,
			999,
		),
	);
}

export function rsvpClosesAt(
	eventDate: string | null,
	rsvpDeadline: string | null,
): Date | null {
	const iso = eventDate ?? rsvpDeadline;
	return iso ? endOfUtcDay(iso) : null;
}

export function isRsvpClosed(
	eventDate: string | null,
	rsvpDeadline: string | null,
	now: Date = new Date(),
): boolean {
	const closesAt = rsvpClosesAt(eventDate, rsvpDeadline);
	return closesAt !== null && now > closesAt;
}
