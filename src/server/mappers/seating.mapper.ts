import { toCanonicalWishlistUrl } from "@/lib/wishlist/share";
import type {
	SeatingBoardViewModel,
	SeatingPersonViewModel,
	SeatingTableViewModel,
} from "@/server/mappers/view-models";
import {
	countSeated,
	personIdFor,
	type SeatingBoard,
	tableLabel,
	toEligiblePeople,
} from "@/server/services/seating.service";

export function mapSeatingBoard(board: SeatingBoard): SeatingBoardViewModel {
	const people = toEligiblePeople(board.invites);
	const eligibleIds = new Set(people.map((person) => person.personId));

	// personId → tableId, built once. Rows for people who are no longer
	// eligible are skipped, so a declined guest stops occupying a seat without
	// their assignment ever being deleted.
	const tableByPerson = new Map<string, string>();
	const seatedAtByPerson = new Map<string, Date>();
	for (const table of board.tables) {
		for (const assignment of table.assignments) {
			const personId = personIdFor(
				assignment.inviteId,
				assignment.extraGuestId,
			);
			if (eligibleIds.has(personId)) {
				tableByPerson.set(personId, table.id);
				seatedAtByPerson.set(personId, assignment.createdAt);
			}
		}
	}

	const tables: SeatingTableViewModel[] = board.tables.map((table) => ({
		id: table.id,
		label: tableLabel(table),
		name: table.name,
		shape: table.shape,
		capacity: table.capacity,
		seated: countSeated(table, people),
		x: table.x,
		y: table.y,
		sortOrder: table.sortOrder,
	}));

	const peopleViewModels: SeatingPersonViewModel[] = people.map((person) => ({
		personId: person.personId,
		displayName: person.displayName,
		partyLabel: person.partyLabel,
		status: person.status,
		isUnnamed: person.isUnnamed,
		inviteId: person.inviteId,
		extraGuestId: person.extraGuestId,
		inviteUrl: toCanonicalWishlistUrl(
			`/w/${board.wishlistSlug}/${person.inviteSlug}`,
		),
		tableId: tableByPerson.get(person.personId) ?? null,
		seatedAt: seatedAtByPerson.get(person.personId)?.toISOString() ?? null,
	}));

	const seatedCount = peopleViewModels.filter(
		(person) => person.tableId !== null,
	).length;
	const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);

	return {
		wishlistId: board.wishlistId,
		tables,
		people: peopleViewModels,
		totals: {
			tables: tables.length,
			capacity: totalCapacity,
			eligiblePeople: peopleViewModels.length,
			seated: seatedCount,
			unseated: peopleViewModels.length - seatedCount,
			declinedExcluded: countDeclined(board),
		},
	};
}

/** Named on the panel so the host knows why the numbers do not add up. */
function countDeclined(board: SeatingBoard): number {
	let declined = 0;
	for (const invite of board.invites) {
		if (invite.status === "declined") {
			declined += 1 + invite.extraGuests.length;
			continue;
		}
		declined += invite.extraGuests.filter(
			(guest) => guest.status === "declined",
		).length;
	}
	return declined;
}
