const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseEventDate(eventDate: Date | string): Date {
	if (eventDate instanceof Date) return eventDate;

	const dateOnly = DATE_ONLY_PATTERN.exec(eventDate);
	if (dateOnly) {
		return new Date(
			Number(dateOnly[1]),
			Number(dateOnly[2]) - 1,
			Number(dateOnly[3]),
		);
	}

	return new Date(eventDate);
}

/**
 * Whole days between `now` and `eventDate`, both floored to midnight.
 * Negative once the event has passed — the signal `formatCountdown` and
 * variant components use to detect a past event without string-matching copy.
 */
export function getCountdownDays(
	eventDate: Date | string,
	now: Date = new Date(),
): number {
	const event = parseEventDate(eventDate);

	const eventMidnight = new Date(
		event.getFullYear(),
		event.getMonth(),
		event.getDate(),
	);
	const nowMidnight = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	);

	return Math.round(
		(eventMidnight.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24),
	);
}

export function formatCountdown(
	eventDate: Date | string,
	now: Date = new Date(),
): string {
	const diffDays = getCountdownDays(eventDate, now);

	if (diffDays > 1) return `Faltan ${diffDays} días`;
	if (diffDays === 1) return "Falta 1 día";
	if (diffDays === 0) return "Es hoy";
	return "Gracias por celebrar con nosotros.";
}

function daysBetween(from: Date, to: Date): number {
	const fromMidnight = new Date(
		from.getFullYear(),
		from.getMonth(),
		from.getDate(),
	).getTime();
	const toMidnight = new Date(
		to.getFullYear(),
		to.getMonth(),
		to.getDate(),
	).getTime();
	return Math.round((toMidnight - fromMidnight) / (1000 * 60 * 60 * 24));
}

/**
 * Percentage of elapsed time between `createdAt` and `eventDate`, clamped to
 * 0–100. Renders full (100) rather than negative/inverted when `createdAt`
 * is after `eventDate` (imported or backdated data).
 */
export function getCountdownProgress(
	createdAt: Date | string,
	eventDate: Date | string,
	now: Date = new Date(),
): number {
	const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
	const event = parseEventDate(eventDate);

	const totalDays = daysBetween(created, event);
	if (totalDays <= 0) return 100;

	const elapsedDays = daysBetween(created, now);
	return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
}
