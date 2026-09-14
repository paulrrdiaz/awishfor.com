import { TRPCError } from "@trpc/server";
import type {
	Prisma,
	SeatingAssignment,
	SeatingTable,
	SeatingTableShape,
} from "@/generated/prisma/client";
import type { InviteWithExtras } from "@/server/services/invite.service";

export const SEATING_MIN_CAPACITY = 1;
export const SEATING_MAX_CAPACITY = 20;
export const SEATING_MAX_TABLES_PER_BATCH = 20;

/** Logical canvas the editor renders; positions are clamped into it. */
export const SEATING_CANVAS_WIDTH = 1200;
export const SEATING_CANVAS_HEIGHT = 800;

/**
 * One eligible, individually seatable human. Derived at read time from the
 * invitation pool — seating never keeps its own copy of the guest list.
 */
export type SeatingPerson = {
	/** Stable draggable id: the extra guest's own id, or `invite:<id>` for the primary guest. */
	personId: string;
	displayName: string;
	partyLabel: string;
	status: string;
	/** True for an extra guest with no name recorded yet. */
	isUnnamed: boolean;
	inviteId: string;
	/** The party's personal invitation slug — the unit a shareable link addresses. */
	inviteSlug: string;
	extraGuestId: string | null;
};

export type SeatingTableWithAssignments = SeatingTable & {
	assignments: SeatingAssignment[];
};

export type SeatingBoard = {
	wishlistId: string;
	/** Public slug, so the mapper can build each party's shareable invite URL. */
	wishlistSlug: string;
	tables: SeatingTableWithAssignments[];
	invites: InviteWithExtras[];
};

export const personIdFor = (inviteId: string, extraGuestId: string | null) =>
	extraGuestId ?? `invite:${inviteId}`;

/**
 * The single eligibility selector. Everything downstream — seat counts, the
 * panel, the print sheet, the `unseatedGuests` badge — derives from this list,
 * so an RSVP change needs no write into the seating tables.
 */
export function toEligiblePeople(invites: InviteWithExtras[]): SeatingPerson[] {
	const people: SeatingPerson[] = [];

	for (const invite of invites) {
		if (invite.status === "declined") continue;

		const partyLabel = invite.primaryName;

		people.push({
			personId: personIdFor(invite.id, null),
			displayName: invite.primaryName,
			partyLabel,
			status: invite.status,
			isUnnamed: false,
			inviteId: invite.id,
			inviteSlug: invite.slug,
			extraGuestId: null,
		});

		for (const guest of invite.extraGuests) {
			if (guest.status === "declined") continue;
			const name = guest.name?.trim();
			people.push({
				personId: personIdFor(invite.id, guest.id),
				displayName: name && name.length > 0 ? name : "Acompañante",
				partyLabel,
				status: guest.status,
				isUnnamed: !name || name.length === 0,
				inviteId: invite.id,
				inviteSlug: invite.slug,
				extraGuestId: guest.id,
			});
		}
	}

	return people;
}

/** Resolves a `personId` back to its `(inviteId, extraGuestId)` pair. */
export function findPerson(
	people: SeatingPerson[],
	personId: string,
): SeatingPerson {
	const person = people.find((candidate) => candidate.personId === personId);
	if (!person) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Esa persona no está en la lista de invitados",
		});
	}
	return person;
}

/**
 * Assignment rows for people who are no longer eligible (they declined) are
 * left in place but ignored, so a reopened RSVP silently restores the seat.
 */
export function countSeated(
	table: SeatingTableWithAssignments,
	people: SeatingPerson[],
): number {
	const eligible = new Set(people.map((person) => person.personId));
	return table.assignments.filter((assignment) =>
		eligible.has(personIdFor(assignment.inviteId, assignment.extraGuestId)),
	).length;
}

type SeatingTableDelegate = {
	findMany(
		args: Prisma.SeatingTableFindManyArgs,
	): Promise<SeatingTableWithAssignments[]>;
	findFirst(
		args: Prisma.SeatingTableFindFirstArgs,
	): Promise<SeatingTableWithAssignments | null>;
	createMany(args: Prisma.SeatingTableCreateManyArgs): Promise<{
		count: number;
	}>;
	update(args: Prisma.SeatingTableUpdateArgs): Promise<SeatingTable>;
	delete(args: Prisma.SeatingTableDeleteArgs): Promise<SeatingTable>;
	count(args?: Prisma.SeatingTableCountArgs): Promise<number>;
	aggregate(args: Prisma.SeatingTableAggregateArgs): Promise<{
		_max: { sortOrder: number | null };
	}>;
};

type SeatingAssignmentDelegate = {
	findMany(
		args: Prisma.SeatingAssignmentFindManyArgs,
	): Promise<SeatingAssignment[]>;
	create(args: Prisma.SeatingAssignmentCreateArgs): Promise<SeatingAssignment>;
	update(args: Prisma.SeatingAssignmentUpdateArgs): Promise<SeatingAssignment>;
	deleteMany(args: Prisma.SeatingAssignmentDeleteManyArgs): Promise<{
		count: number;
	}>;
};

type InviteReadDelegate = {
	findMany(args: Prisma.InviteFindManyArgs): Promise<InviteWithExtras[]>;
};

type WishlistSlugDelegate = {
	findFirst(
		args: Prisma.WishlistFindFirstArgs,
	): Promise<{ slug: string } | null>;
};

export type SeatingDatabase = {
	seatingTable: SeatingTableDelegate;
	seatingAssignment: SeatingAssignmentDelegate;
	invite: InviteReadDelegate;
	wishlist: WishlistSlugDelegate;
};

export type SeatingTransactionDatabase = SeatingDatabase & {
	$queryRaw<T = unknown>(
		query: TemplateStringsArray,
		...values: unknown[]
	): Promise<T>;
};

export type SeatingMutationDatabase = SeatingDatabase & {
	$transaction<T>(
		callback: (tx: SeatingTransactionDatabase) => Promise<T>,
	): Promise<T>;
};

// Most recently seated first: the capacity-reduction refusal suggests who moves
// by recency, and the dialog has to name the same people the service names.
const tableInclude = {
	assignments: { orderBy: { createdAt: "desc" as const } },
} as const;

const listInvitesForSeating = (db: SeatingDatabase, wishlistId: string) =>
	db.invite.findMany({
		where: { wishlistId },
		include: { extraGuests: { orderBy: { sortOrder: "asc" } } },
		orderBy: { createdAt: "asc" },
	});

export const listBoard = async (
	db: SeatingDatabase,
	{ wishlistId }: { wishlistId: string },
): Promise<SeatingBoard> => {
	const [tables, invites, wishlist] = await Promise.all([
		db.seatingTable.findMany({
			where: { wishlistId },
			include: tableInclude,
			orderBy: { sortOrder: "asc" },
		}),
		listInvitesForSeating(db, wishlistId),
		db.wishlist.findFirst({
			where: { id: wishlistId },
			select: { slug: true },
		}),
	]);

	return { wishlistId, wishlistSlug: wishlist?.slug ?? "", tables, invites };
};

const assertCapacity = (capacity: number) => {
	if (
		!Number.isInteger(capacity) ||
		capacity < SEATING_MIN_CAPACITY ||
		capacity > SEATING_MAX_CAPACITY
	) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: `La capacidad debe ser un número entero entre ${SEATING_MIN_CAPACITY} y ${SEATING_MAX_CAPACITY}`,
		});
	}
};

const clamp = (value: number, max: number) =>
	Math.max(0, Math.min(Math.round(value), max));

/**
 * Batch creation staggers each copy down-right so none is created fully hidden
 * behind the one before it, wrapping back to the left edge at the canvas end.
 */
const STAGGER_X = 168;
const STAGGER_Y = 148;
const STAGGER_COLUMNS = 6;

export const staggeredPosition = (
	origin: { x: number; y: number },
	index: number,
) => {
	const column = index % STAGGER_COLUMNS;
	const row = Math.floor(index / STAGGER_COLUMNS);
	return {
		x: clamp(origin.x + column * STAGGER_X, SEATING_CANVAS_WIDTH - 160),
		y: clamp(origin.y + row * STAGGER_Y, SEATING_CANVAS_HEIGHT - 160),
	};
};

export const createTables = async (
	db: SeatingDatabase,
	{
		wishlistId,
		shape,
		capacity,
		name,
		count = 1,
		x,
		y,
	}: {
		wishlistId: string;
		shape: SeatingTableShape;
		capacity: number;
		name?: string | null;
		count?: number;
		x?: number;
		y?: number;
	},
): Promise<void> => {
	assertCapacity(capacity);
	if (!Number.isInteger(count) || count < 1) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "La cantidad de mesas debe ser al menos 1",
		});
	}
	if (count > SEATING_MAX_TABLES_PER_BATCH) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: `Puedes agregar hasta ${SEATING_MAX_TABLES_PER_BATCH} mesas a la vez`,
		});
	}

	const existing = await db.seatingTable.aggregate({
		where: { wishlistId },
		_max: { sortOrder: true },
	});
	const nextSortOrder = (existing._max.sortOrder ?? -1) + 1;
	const origin = { x: x ?? 96, y: y ?? 108 };

	await db.seatingTable.createMany({
		data: Array.from({ length: count }, (_unused, index) => {
			const position = staggeredPosition(origin, nextSortOrder + index);
			return {
				wishlistId,
				name: name?.trim() ? name.trim() : null,
				shape,
				capacity,
				x: position.x,
				y: position.y,
				sortOrder: nextSortOrder + index,
			};
		}),
	});
};

const getScopedTable = async (
	db: SeatingDatabase,
	{ wishlistId, tableId }: { wishlistId: string; tableId: string },
): Promise<SeatingTableWithAssignments> => {
	const table = await db.seatingTable.findFirst({
		where: { id: tableId, wishlistId },
		include: tableInclude,
	});
	if (!table) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Mesa no encontrada" });
	}
	return table;
};

export const tableLabel = (table: Pick<SeatingTable, "name" | "sortOrder">) =>
	table.name?.trim() ? table.name.trim() : `Mesa ${table.sortOrder + 1}`;

/**
 * Refuses a capacity below the current seated count rather than ejecting
 * anybody. The names come back on the error so the dialog can say who has to
 * move first — enforced here, not only in the dialog.
 */
export const updateTable = async (
	db: SeatingDatabase,
	{
		wishlistId,
		tableId,
		name,
		shape,
		capacity,
	}: {
		wishlistId: string;
		tableId: string;
		name?: string | null;
		shape?: SeatingTableShape;
		capacity?: number;
	},
): Promise<SeatingTable> => {
	const table = await getScopedTable(db, { wishlistId, tableId });

	if (capacity !== undefined) {
		assertCapacity(capacity);
		const invites = await listInvitesForSeating(db, wishlistId);
		const people = toEligiblePeople(invites);
		const seated = countSeated(table, people);

		if (capacity < seated) {
			const byPersonId = new Map(
				people.map((person) => [person.personId, person]),
			);
			const mustMove = table.assignments
				.map((assignment) =>
					byPersonId.get(
						personIdFor(assignment.inviteId, assignment.extraGuestId),
					),
				)
				.filter((person): person is SeatingPerson => person !== undefined)
				.slice(0, seated - capacity)
				.map((person) => person.displayName);

			throw new TRPCError({
				code: "CONFLICT",
				message: `No se puede bajar a ${capacity}: hay ${seated} personas sentadas. Mueve primero a ${mustMove.join(", ")}.`,
			});
		}
	}

	return db.seatingTable.update({
		where: { id: table.id },
		data: {
			...(name !== undefined
				? { name: name?.trim() ? name.trim() : null }
				: {}),
			...(shape !== undefined ? { shape } : {}),
			...(capacity !== undefined ? { capacity } : {}),
		},
	});
};

export const moveTable = async (
	db: SeatingDatabase,
	{
		wishlistId,
		tableId,
		x,
		y,
	}: { wishlistId: string; tableId: string; x: number; y: number },
): Promise<SeatingTable> => {
	const table = await getScopedTable(db, { wishlistId, tableId });
	return db.seatingTable.update({
		where: { id: table.id },
		data: {
			x: clamp(x, SEATING_CANVAS_WIDTH),
			y: clamp(y, SEATING_CANVAS_HEIGHT),
		},
	});
};

/** Assignments go with the table by FK cascade; nobody is silently re-seated. */
export const deleteTable = async (
	db: SeatingDatabase,
	{ wishlistId, tableId }: { wishlistId: string; tableId: string },
): Promise<void> => {
	const table = await getScopedTable(db, { wishlistId, tableId });
	await db.seatingTable.delete({ where: { id: table.id } });
};

const personWhere = (person: SeatingPerson) => ({
	inviteId: person.inviteId,
	extraGuestId: person.extraGuestId,
});

/**
 * Seats one person, moving them off any previous table in the same write.
 *
 * The `SELECT … FOR UPDATE` is load-bearing: `$transaction` runs at Postgres's
 * default READ COMMITTED, where a `count()` over rows that do not exist yet
 * takes no lock, so two concurrent drops could both read `seated = capacity - 1`
 * and both insert. Locking the table row first serialises the writers.
 */
export const assignPerson = async (
	db: SeatingMutationDatabase,
	{
		wishlistId,
		tableId,
		personId,
	}: { wishlistId: string; tableId: string; personId: string },
): Promise<void> => {
	const invites = await listInvitesForSeating(db, wishlistId);
	const people = toEligiblePeople(invites);
	const person = findPerson(people, personId);

	await db.$transaction(async (tx) => {
		await tx.$queryRaw`SELECT id FROM "SeatingTable" WHERE id = ${tableId} FOR UPDATE`;

		const table = await tx.seatingTable.findFirst({
			where: { id: tableId, wishlistId },
			include: tableInclude,
		});
		if (!table) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Mesa no encontrada" });
		}

		const alreadyHere = table.assignments.some(
			(assignment) =>
				personIdFor(assignment.inviteId, assignment.extraGuestId) === personId,
		);
		if (alreadyHere) return;

		if (countSeated(table, people) >= table.capacity) {
			throw new TRPCError({
				code: "CONFLICT",
				message: `${tableLabel(table)} está completa (${table.capacity}/${table.capacity}). Cambia su capacidad o elige otra mesa.`,
			});
		}

		// Upsert on the person key. Prisma cannot address the partial unique
		// indexes in a `where`, so the move is a scoped delete plus an insert
		// inside the same transaction.
		await tx.seatingAssignment.deleteMany({
			where: { wishlistId, ...personWhere(person) },
		});
		try {
			await tx.seatingAssignment.create({
				data: {
					wishlistId,
					tableId: table.id,
					inviteId: person.inviteId,
					extraGuestId: person.extraGuestId,
				},
			});
		} catch (error) {
			// The row lock serialises writers per table, so it cannot serialise the
			// same person being dropped on two *different* tables at once. The
			// partial unique indexes catch that; surface it as a conflict rather
			// than an unhandled database error.
			if (isUniqueViolation(error)) {
				throw new TRPCError({
					code: "CONFLICT",
					message: `${person.displayName} ya fue sentada en otra mesa. Actualiza la vista e intenta de nuevo.`,
				});
			}
			throw error;
		}
	});
};

const isUniqueViolation = (error: unknown): boolean =>
	typeof error === "object" &&
	error !== null &&
	"code" in error &&
	(error as { code?: unknown }).code === "P2002";

/** Idempotent: unseating somebody who has no table is a no-op, not an error. */
export const unassignPerson = async (
	db: SeatingDatabase,
	{ wishlistId, personId }: { wishlistId: string; personId: string },
): Promise<void> => {
	const invites = await listInvitesForSeating(db, wishlistId);
	const person = findPerson(toEligiblePeople(invites), personId);
	await db.seatingAssignment.deleteMany({
		where: { wishlistId, ...personWhere(person) },
	});
};
