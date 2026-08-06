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

export function formatCountdown(
	eventDate: Date | string,
	now: Date = new Date(),
): string {
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

	const diffDays = Math.round(
		(eventMidnight.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffDays > 1) return `Faltan ${diffDays} días`;
	if (diffDays === 1) return "Falta 1 día";
	if (diffDays === 0) return "Es hoy";
	return "Gracias por celebrar con nosotros.";
}
