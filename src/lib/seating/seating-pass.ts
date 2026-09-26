import { calendarDaysUntil } from "@/lib/dates/calendar-days";
import { tableLabel } from "@/lib/seating/table-label";
import type {
	SeatingPassMemberViewModel,
	SeatingPassTableViewModel,
	SeatingPassViewModel,
} from "@/server/mappers/view-models";

export const SEATING_PASS_WINDOW_DAYS = 5;
export const UNSEATED_LABEL = "Mesa por confirmar";
const UNNAMED_COMPANION = "Acompañante";

export type SeatingPassAssignmentRow = {
	inviteId: string;
	extraGuestId: string | null;
	invite: { status: string; primaryName: string };
	extraGuest: { status: string; name: string | null } | null;
};

export type SeatingPassTableRow = {
	id: string;
	name: string | null;
	sortOrder: number;
	capacity: number;
	assignments: SeatingPassAssignmentRow[];
};

export type SeatingPassInvite = {
	id: string;
	status: string;
	primaryName: string;
	extraGuests: { id: string; name: string | null; status: string }[];
};

export type BuildSeatingPassInput = {
	eventDate: string | null;
	eventTime: string | null;
	eventLocation: string | null;
	showMates: boolean;
	showMap: boolean;
	invite: SeatingPassInvite;
	tables: SeatingPassTableRow[];
};

/** Cheap gate (no seating data needed): event window + confirmed invite. */
export function isSeatingPassWindowOpen(
	eventDate: string | null,
	inviteStatus: string,
	now: Date,
): boolean {
	if (!eventDate || inviteStatus !== "confirmed") return false;
	return calendarDaysUntil(eventDate, now) <= SEATING_PASS_WINDOW_DAYS;
}

export function shortName(name: string): string | null {
	const tokens = name.trim().split(/\s+/).filter(Boolean);
	if (tokens.length === 0) return null;
	if (tokens.length === 1) return tokens[0] ?? null;
	const last = tokens[tokens.length - 1] ?? "";
	return `${tokens[0]} ${last.charAt(0).toUpperCase()}.`;
}

export function tableNumeral(label: string): string {
	const match = /^Mesa\s+(\d+)$/i.exec(label);
	return match?.[1] ?? label;
}

export function countdownLabel(daysAway: number): string | null {
	if (daysAway < 0) return null;
	if (daysAway === 0) return "Hoy";
	if (daysAway === 1) return "Mañana";
	return `Faltan ${daysAway} días`;
}

export function buildSeatingPass(
	input: BuildSeatingPassInput,
	now: Date,
): SeatingPassViewModel | null {
	const { invite, eventDate } = input;
	if (!isSeatingPassWindowOpen(eventDate, invite.status, now) || !eventDate) {
		return null;
	}
	const daysAway = calendarDaysUntil(eventDate, now);

	const party = [
		{ id: null as string | null, name: invite.primaryName },
		...invite.extraGuests
			.filter((guest) => guest.status === "confirmed")
			.map((guest) => ({
				id: guest.id as string | null,
				name: guest.name?.trim() || UNNAMED_COMPANION,
			})),
	];

	const orderedTables = [...input.tables].sort(
		(a, b) => a.sortOrder - b.sortOrder,
	);
	const tableIdByMember = new Map<string | null, string>();
	for (const table of orderedTables) {
		for (const row of table.assignments) {
			if (
				row.inviteId === invite.id &&
				!tableIdByMember.has(row.extraGuestId)
			) {
				tableIdByMember.set(row.extraGuestId, table.id);
			}
		}
	}
	const tableById = new Map(orderedTables.map((table) => [table.id, table]));

	const members: SeatingPassMemberViewModel[] = party.map((member) => {
		const tableId = tableIdByMember.get(member.id) ?? null;
		const table = tableId ? tableById.get(tableId) : undefined;
		return {
			id: member.id ?? invite.id,
			name: member.name,
			label: table ? tableLabel(table) : UNSEATED_LABEL,
			tableId: table?.id ?? null,
		};
	});

	if (members.every((member) => member.tableId === null)) return null;

	const tables: SeatingPassTableViewModel[] = orderedTables
		.filter((table) => members.some((member) => member.tableId === table.id))
		.map((table) => {
			const label = tableLabel(table);
			const mates = input.showMates
				? table.assignments.flatMap((row) => {
						if (row.inviteId === invite.id) return [];
						if (row.invite.status !== "confirmed") return [];
						if (row.extraGuestId === null) {
							const short = shortName(row.invite.primaryName);
							return short ? [short] : [];
						}
						if (row.extraGuest?.status !== "confirmed") return [];
						const short = row.extraGuest.name
							? shortName(row.extraGuest.name)
							: null;
						return short ? [short] : [];
					})
				: [];
			return {
				id: table.id,
				label,
				numeral: tableNumeral(label),
				capacity: table.capacity,
				memberNames: members
					.filter((member) => member.tableId === table.id)
					.map((member) => member.name),
				mates,
			};
		});

	const primaryTable = tables.find((table) => table.id === members[0]?.tableId);
	const headlineTable = primaryTable ?? tables[0];
	if (!headlineTable) return null;

	const location = input.eventLocation?.trim() || null;

	return {
		primaryName: invite.primaryName,
		daysAway,
		countdownLabel: countdownLabel(daysAway),
		eventDate,
		eventTime: input.eventTime,
		location: input.showMap ? location : null,
		members,
		tables,
		headline: { label: headlineTable.label, numeral: headlineTable.numeral },
	};
}
