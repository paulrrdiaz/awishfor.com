import { getCountdownDays } from "@/lib/format/countdown";

/** Compact date label, e.g. "12 de septiembre". */
export function formatShortEventDate(iso: string): string {
	const date = new Date(iso);
	return new Intl.DateTimeFormat("es-419", {
		day: "numeric",
		month: "long",
		timeZone: "UTC",
	}).format(date);
}

/** "en 4 días" / "mañana" / "hoy" / "hace 3 días", relative to `now`. */
export function formatRelativeDaysLabel(
	iso: string,
	now: Date = new Date(),
): string {
	const diffDays = getCountdownDays(iso, now);

	if (diffDays > 1) return `en ${diffDays} días`;
	if (diffDays === 1) return "mañana";
	if (diffDays === 0) return "hoy";
	if (diffDays === -1) return "ayer";
	return `hace ${Math.abs(diffDays)} días`;
}

/** "Vence en 3 días" / "Vence hoy" / "Vence mañana" for an RSVP deadline badge. */
export function formatDeadlineBadge(
	iso: string,
	now: Date = new Date(),
): string {
	const diffDays = getCountdownDays(iso, now);

	if (diffDays > 1) return `Vence en ${diffDays} días`;
	if (diffDays === 1) return "Vence mañana";
	if (diffDays === 0) return "Vence hoy";
	return "Venció";
}
