export function formatCountdown(
	eventDate: Date | string,
	now: Date = new Date(),
): string {
	const event = typeof eventDate === "string" ? new Date(eventDate) : eventDate;

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
