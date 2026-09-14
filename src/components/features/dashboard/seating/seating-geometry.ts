import type {
	SeatingPersonViewModel,
	SeatingTableViewModel,
} from "@/server/mappers/view-models";

/**
 * Size is derived from capacity rather than stored, so the relative scale of
 * the room reads without labels (`Claude Design Output - Mesas.md` §4).
 */
export const tableGeometry = (table: {
	shape: string;
	capacity: number;
}): { width: number; height: number } =>
	table.shape === "round"
		? (() => {
				const diameter = Math.round(72 + table.capacity * 5.6);
				return { width: diameter, height: diameter };
			})()
		: { width: Math.round(96 + table.capacity * 11), height: 100 };

export type TableVisualState =
	| "empty"
	| "open"
	| "full"
	| "valid"
	| "invalid"
	| "selected"
	| "dragging";

/** The state is written in the subtitle too, so nothing depends on colour. */
export const tableStateLabel = (
	state: TableVisualState,
	shape: string,
): string => {
	switch (state) {
		case "full":
			return "completa";
		case "empty":
			// The design output writes "sin lugares" here, but on an empty table
			// that reads as "no seats available" — the opposite of the truth. The
			// point of the subtitle is that the state never depends on colour, so
			// it has to be accurate.
			return "vacía";
		case "invalid":
			return "completa";
		default:
			return shape === "round" ? "redonda" : "rectangular";
	}
};

export const tableAriaLabel = (
	table: Pick<SeatingTableViewModel, "label" | "seated" | "capacity">,
	state: TableVisualState,
	shape: string,
	/** Named here too, so the seat bubbles are not the only way to read the table. */
	seatedPeople: SeatingPersonViewModel[] = [],
) => {
	const base = `${table.label}, ${table.seated} de ${table.capacity} asientos ocupados, ${tableStateLabel(state, shape)}`;
	if (seatedPeople.length === 0) return base;
	return `${base}. Sentados: ${seatedPeople.map(seatFullLabel).join(", ")}`;
};

/** The name a seat bubble shows: a first name is what someone scans for. */
export const seatShortLabel = (person: SeatingPersonViewModel): string => {
	if (person.isUnnamed) return "Acomp.";
	const [first] = person.displayName.trim().split(/\s+/);
	return first ?? person.displayName;
};

export const seatInitials = (person: SeatingPersonViewModel): string => {
	if (person.isUnnamed) return "+1";
	return (
		person.displayName
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? "")
			.join("") || "?"
	);
};

export const seatFullLabel = (person: SeatingPersonViewModel): string =>
	person.isUnnamed ? `Acompañante de ${person.partyLabel}` : person.displayName;

/**
 * How much of each bubble fits. A round table for 20 has ~680px of ring to
 * spend, so full first names stop fitting well before the capacity cap — the
 * bubble degrades to initials and then to a bare status dot rather than
 * overlapping its neighbours.
 */
export type SeatBubbleMode = "name" | "initials" | "dot";

export type SeatBubble = {
	personId: string;
	label: string;
	title: string;
	status: string;
	statusLabel: string;
	partyLabel: string;
	inviteUrl: string;
	isUnnamed: boolean;
	/** Centre of the bubble, in table-local px. */
	x: number;
	y: number;
};

export const seatStatusLabel = (status: string): string => {
	switch (status) {
		case "confirmed":
			return "Confirmado";
		case "declined":
			return "No asistirá";
		default:
			return "Pendiente de respuesta";
	}
};

export type SeatBubbleLayout = {
	mode: SeatBubbleMode;
	bubbles: SeatBubble[];
};

/**
 * Thresholds are centre-to-centre spacing in px, measured against the bubble
 * widths below: a truncated first name occupies ~52px, an initials disc 19px.
 * A round table for 10 — the common case — lands at ~50px and keeps names; a
 * table for 16 or more falls back to initials rather than overlapping.
 */
const modeForSpacing = (spacing: number): SeatBubbleMode =>
	spacing >= 40 ? "name" : spacing >= 24 ? "initials" : "dot";

/**
 * Seats are laid out on *capacity* slots, not on the number of people present,
 * so somebody leaving a table does not shuffle everyone else around the rim.
 */
export function seatBubbleLayout(
	table: Pick<SeatingTableViewModel, "shape" | "capacity">,
	people: SeatingPersonViewModel[],
): SeatBubbleLayout {
	const { width, height } = tableGeometry(table);
	const slots = Math.max(table.capacity, people.length, 1);

	const positions: { x: number; y: number }[] = [];
	let spacing: number;

	if (table.shape === "round") {
		const ringRadius = width / 2 + 15;
		spacing = (2 * Math.PI * ringRadius) / slots;
		for (let index = 0; index < people.length; index += 1) {
			// Start at 12 o'clock and go clockwise, the way a host reads a table.
			const angle = -Math.PI / 2 + (index * 2 * Math.PI) / slots;
			positions.push({
				x: width / 2 + ringRadius * Math.cos(angle),
				y: height / 2 + ringRadius * Math.sin(angle),
			});
		}
	} else {
		const topSlots = Math.ceil(slots / 2);
		const bottomSlots = Math.max(1, slots - topSlots);
		spacing = width / topSlots;
		for (let index = 0; index < people.length; index += 1) {
			const onTop = index < topSlots;
			const column = onTop ? index : index - topSlots;
			const columns = onTop ? topSlots : bottomSlots;
			positions.push({
				x: (width * (column + 0.5)) / columns,
				y: onTop ? -13 : height + 13,
			});
		}
	}

	const mode = modeForSpacing(spacing);

	return {
		mode,
		bubbles: people.map((person, index) => ({
			personId: person.personId,
			label: mode === "name" ? seatShortLabel(person) : seatInitials(person),
			title: seatFullLabel(person),
			status: person.status,
			statusLabel: seatStatusLabel(person.status),
			partyLabel: person.partyLabel,
			inviteUrl: person.inviteUrl,
			isUnnamed: person.isUnnamed,
			x: positions[index]?.x ?? 0,
			y: positions[index]?.y ?? 0,
		})),
	};
}

export const SEATING_GRID = 26;
export const SEATING_CANVAS_W = 1200;
export const SEATING_CANVAS_H = 800;

/** Groups the unseated pool by invitation, preserving the board's order. */
export type PartyGroup = {
	inviteId: string;
	partyLabel: string;
	people: SeatingPersonViewModel[];
	partySize: number;
	unseated: number;
};

export function groupByParty(
	people: SeatingPersonViewModel[],
	all: SeatingPersonViewModel[],
): PartyGroup[] {
	const partySizes = new Map<string, number>();
	for (const person of all) {
		partySizes.set(person.inviteId, (partySizes.get(person.inviteId) ?? 0) + 1);
	}

	const groups = new Map<string, PartyGroup>();
	for (const person of people) {
		const existing = groups.get(person.inviteId);
		if (existing) {
			existing.people.push(person);
			existing.unseated += 1;
			continue;
		}
		groups.set(person.inviteId, {
			inviteId: person.inviteId,
			partyLabel: person.partyLabel,
			people: [person],
			partySize: partySizes.get(person.inviteId) ?? 1,
			unseated: 1,
		});
	}
	return [...groups.values()];
}

export const matchesSeatingSearch = (
	person: SeatingPersonViewModel,
	query: string,
): boolean => {
	const needle = query.trim().toLowerCase();
	if (needle.length === 0) return true;
	return (
		person.displayName.toLowerCase().includes(needle) ||
		person.partyLabel.toLowerCase().includes(needle)
	);
};
