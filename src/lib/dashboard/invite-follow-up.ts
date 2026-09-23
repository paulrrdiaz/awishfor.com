import { isRsvpClosed } from "@/lib/wishlist/rsvp-window";

export type InviteFollowUpKind =
	| "invitation"
	| "rsvp_reminder"
	| "event_14_day"
	| "event_7_day"
	| "event_1_day";

export type ViewRecency = "never" | "recent" | "intermediate" | "stale";

export type FollowUpEmphasis = "recommended" | "normal" | "deemphasized";

export type EventProximity = {
	daysAway: number;
	label: string;
	stage: "within_14_days" | "within_7_days" | "tomorrow" | "today" | "past";
};

export type InviteFollowUpInput = {
	status: string;
	viewRecency: ViewRecency;
	lastFollowUpKind: InviteFollowUpKind | null | undefined;
	eventDate: string | null;
	rsvpDeadline: string | null;
	now: Date;
};

export type InviteFollowUp = {
	kind: InviteFollowUpKind;
	viewRecency: ViewRecency;
	emphasis: FollowUpEmphasis;
	indicator: string;
};

export function inviteFollowUpLabel(kind: InviteFollowUpKind): string {
	const labels: Record<InviteFollowUpKind, string> = {
		invitation: "Copiar invitación",
		rsvp_reminder: "Copiar recordatorio RSVP",
		event_14_day: "Copiar aviso de 14 días",
		event_7_day: "Copiar recordatorio del evento",
		event_1_day: "Copiar recordatorio para mañana",
	};
	return labels[kind];
}

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

export function classifyViewRecency(
	lastViewedAt: string | null | undefined,
	now: Date,
): ViewRecency {
	if (!lastViewedAt) return "never";
	const age = now.getTime() - new Date(lastViewedAt).getTime();
	if (age <= 48 * 60 * 60 * 1000) return "recent";
	if (age <= 14 * millisecondsPerDay) return "intermediate";
	return "stale";
}

export function getEventProximity(
	eventDate: string | null,
	now: Date,
): EventProximity | null {
	if (!eventDate) return null;
	const daysAway = calendarDaysUntil(eventDate, now);
	if (daysAway > 14) return null;
	if (daysAway < 0)
		return { daysAway, label: "El evento ya pasó", stage: "past" };
	if (daysAway === 0)
		return { daysAway, label: "El evento es hoy", stage: "today" };
	if (daysAway === 1)
		return { daysAway, label: "El evento es mañana", stage: "tomorrow" };
	if (daysAway <= 7)
		return {
			daysAway,
			label: `Faltan ${daysAway} días para el evento`,
			stage: "within_7_days",
		};
	return {
		daysAway,
		label: `Faltan ${daysAway} días para el evento`,
		stage: "within_14_days",
	};
}

function followUpKindFor(
	input: InviteFollowUpInput,
): InviteFollowUpKind | null {
	if (input.status === "declined") return null;
	if (input.eventDate && calendarDaysUntil(input.eventDate, input.now) <= 0) {
		return null;
	}
	if (input.status === "pending") {
		return input.viewRecency !== "never" ? "rsvp_reminder" : "invitation";
	}
	if (input.status !== "confirmed" || !input.eventDate) return null;
	const daysAway = calendarDaysUntil(input.eventDate, input.now);
	if (daysAway >= 8 && daysAway <= 14) return "event_14_day";
	if (daysAway >= 2 && daysAway <= 7) return "event_7_day";
	if (daysAway === 1) return "event_1_day";
	return null;
}

function indicatorFor(
	recency: ViewRecency,
	emphasis: FollowUpEmphasis,
): string {
	if (recency === "never") return "No se registró ninguna vista";
	if (recency === "recent") return "Vio los detalles recientemente";
	if (emphasis === "recommended") return "Conviene recordarle a esta persona";
	return recency === "stale"
		? "Hace tiempo que no revisa los detalles"
		: "Revisó los detalles anteriormente";
}

export function deriveInviteFollowUp(
	input: InviteFollowUpInput,
): InviteFollowUp | null {
	const kind = followUpKindFor(input);
	if (!kind) return null;
	const viewRecency = input.viewRecency;
	const sameStageCopied = input.lastFollowUpKind === kind;
	const emphasis: FollowUpEmphasis =
		sameStageCopied || viewRecency === "recent"
			? "deemphasized"
			: viewRecency === "never" || viewRecency === "stale"
				? "recommended"
				: "normal";
	return {
		kind,
		viewRecency,
		emphasis,
		indicator: indicatorFor(viewRecency, emphasis),
	};
}

export type FollowUpMessageInput = {
	kind: InviteFollowUpKind;
	guestName: string;
	inviteUrl: string;
	eventType: string | null | undefined;
	eventDate: string | null;
	eventTime: string | null;
	eventLocation: string | null;
	rsvpDeadline: string | null;
	now: Date;
};

function eventName(eventType: string | null | undefined): string {
	return (
		{
			baby_shower: "baby shower",
			birthday: "cumpleaños",
			wedding: "boda",
			housewarming: "celebración en nuestro nuevo hogar",
			general: "evento",
		}[eventType ?? "general"] ?? "evento"
	);
}

function formatEventDate(value: string): string {
	return new Intl.DateTimeFormat("es-PE", {
		dateStyle: "long",
		timeZone: "UTC",
	}).format(new Date(value));
}

function eventDetails(input: FollowUpMessageInput): string {
	if (!input.eventDate) return "";
	const details = [`el ${formatEventDate(input.eventDate)}`];
	if (input.eventTime) details.push(`a las ${input.eventTime}`);
	if (input.eventLocation) details.push(`en ${input.eventLocation}`);
	return details.join(", ");
}

export function buildInviteFollowUpMessage(
	input: FollowUpMessageInput,
): string {
	const greeting = `¡Hola ${input.guestName}!`;
	const name = eventName(input.eventType);
	if (input.kind === "invitation") {
		return `${greeting} Nos encantaría que nos acompañes en nuestro ${name}. Puedes ver los detalles y confirmar tu asistencia aquí: ${input.inviteUrl}`;
	}
	if (input.kind === "rsvp_reminder") {
		const deadlineClosed = isRsvpClosed(null, input.rsvpDeadline, input.now);
		return deadlineClosed
			? `${greeting} Queríamos compartirte los detalles de nuestro ${name}. La confirmación por la página ya cerró; por favor, respóndenos directamente si podrás acompañarnos: ${input.inviteUrl}`
			: `${greeting} Te recordamos nuestro ${name}. ¿Podrías confirmar si nos acompañas? Aquí tienes los detalles: ${input.inviteUrl}`;
	}
	const stage =
		input.kind === "event_14_day"
			? "Faltan dos semanas"
			: input.kind === "event_7_day"
				? "Ya falta poco"
				: "¡Es mañana!";
	const details = eventDetails(input);
	return `${greeting} ${stage} para nuestro ${name}${details ? `, ${details}` : ""}. Te compartimos los detalles por aquí: ${input.inviteUrl}`;
}
