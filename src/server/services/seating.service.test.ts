import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import type {
	InviteExtraGuest,
	SeatingAssignment,
	SeatingTable,
} from "@/generated/prisma/client";
import type { InviteWithExtras } from "@/server/services/invite.service";
import {
	assignPerson,
	countSeated,
	personIdFor,
	type SeatingMutationDatabase,
	type SeatingTableWithAssignments,
	toEligiblePeople,
	unassignPerson,
	updateTable,
} from "@/server/services/seating.service";

const NOW = new Date("2026-09-13T12:00:00.000Z");

const makeInvite = (overrides: Partial<InviteWithExtras> = {}) =>
	({
		id: "invite_1",
		wishlistId: "wishlist_1",
		primaryName: "María Torres",
		primaryEmail: null,
		primaryPhone: null,
		slug: "maria-torres",
		status: "confirmed",
		openedAt: null,
		viewCount: 0,
		lastViewedAt: null,
		lastFollowUpKind: null,
		lastFollowUpCopiedAt: null,
		respondedAt: null,
		responseSource: null,
		responseLockedAt: null,
		createdAt: NOW,
		updatedAt: NOW,
		extraGuests: [],
		...overrides,
	}) as InviteWithExtras;

const makeExtra = (
	overrides: Partial<InviteExtraGuest> = {},
): InviteExtraGuest =>
	({
		id: "extra_1",
		inviteId: "invite_1",
		name: "Lucía Torres",
		status: "confirmed",
		sortOrder: 0,
		...overrides,
	}) as InviteExtraGuest;

const makeTable = (
	overrides: Partial<SeatingTableWithAssignments> = {},
): SeatingTableWithAssignments =>
	({
		id: "table_1",
		wishlistId: "wishlist_1",
		name: null,
		shape: "round",
		capacity: 2,
		x: 100,
		y: 100,
		sortOrder: 0,
		createdAt: NOW,
		updatedAt: NOW,
		assignments: [],
		...overrides,
	}) as SeatingTableWithAssignments;

const makeAssignment = (
	overrides: Partial<SeatingAssignment> = {},
): SeatingAssignment =>
	({
		id: `assignment_${Math.random().toString(36).slice(2)}`,
		wishlistId: "wishlist_1",
		tableId: "table_1",
		inviteId: "invite_1",
		extraGuestId: null,
		createdAt: NOW,
		...overrides,
	}) as SeatingAssignment;

describe("toEligiblePeople", () => {
	it("drops the whole party when the invitation is declined", () => {
		const people = toEligiblePeople([
			makeInvite({
				status: "declined",
				extraGuests: [makeExtra({ status: "confirmed" })],
			}),
		]);

		expect(people).toEqual([]);
	});

	it("drops only the declined extra guest", () => {
		const people = toEligiblePeople([
			makeInvite({
				status: "confirmed",
				extraGuests: [
					makeExtra({ id: "extra_pending", status: "pending" }),
					makeExtra({ id: "extra_declined", status: "declined" }),
				],
			}),
		]);

		expect(people.map((person) => person.personId)).toEqual([
			"invite:invite_1",
			"extra_pending",
		]);
	});

	it("keeps an unnamed extra guest seatable with a party-derived label", () => {
		const [, companion] = toEligiblePeople([
			makeInvite({ extraGuests: [makeExtra({ id: "extra_x", name: null })] }),
		]);

		expect(companion).toMatchObject({
			personId: "extra_x",
			displayName: "Acompañante",
			partyLabel: "María Torres",
			isUnnamed: true,
		});
	});

	it("never collides a primary guest's id with an extra guest's id", () => {
		const people = toEligiblePeople([
			// An extra guest whose own id is the raw invite id it belongs to.
			makeInvite({
				id: "invite_1",
				extraGuests: [makeExtra({ id: "invite_1" })],
			}),
		]);

		const ids = people.map((person) => person.personId);
		expect(new Set(ids).size).toBe(ids.length);
		expect(ids).toEqual(["invite:invite_1", "invite_1"]);
	});
});

/**
 * An in-memory stand-in for the seating tables. `$transaction` + `$queryRaw`
 * model Postgres's `SELECT … FOR UPDATE` as a per-table-row mutex so the
 * concurrency test exercises the real ordering the service depends on: the
 * occupancy re-count must happen *inside* the lock. It does not reproduce
 * Postgres's isolation semantics or its unique indexes — those are verified
 * against the real database (see tasks 1.3 / 2.8).
 */
function makeSeatingDb({
	invites = [makeInvite()],
	tables = [makeTable()],
}: {
	invites?: InviteWithExtras[];
	tables?: SeatingTableWithAssignments[];
} = {}) {
	const rows: SeatingAssignment[] = tables.flatMap(
		(table) => table.assignments,
	);
	const locks = new Map<string, Promise<void>>();
	const queryLog: string[] = [];

	// `tableInclude` asks for `orderBy: { createdAt: "desc" }`; insertion order
	// stands in for creation order here, so newest-first is the reverse of `rows`.
	const tableWithRows = (table: SeatingTable): SeatingTableWithAssignments => ({
		...table,
		assignments: rows.filter((row) => row.tableId === table.id).reverse(),
	});

	const client = {
		invite: {
			findMany: async () => invites,
		},
		seatingTable: {
			findMany: async () => tables.map(tableWithRows),
			findFirst: async ({
				where,
			}: {
				where: { id?: string; wishlistId?: string };
			}) => {
				queryLog.push(`findFirst:${where.id}`);
				const table = tables.find(
					(candidate) =>
						candidate.id === where.id &&
						(where.wishlistId === undefined ||
							candidate.wishlistId === where.wishlistId),
				);
				return table ? tableWithRows(table) : null;
			},
			createMany: async () => ({ count: 0 }),
			update: async ({
				where,
				data,
			}: {
				where: { id: string };
				data: Record<string, unknown>;
			}) => {
				const table = tables.find((candidate) => candidate.id === where.id);
				if (!table) throw new Error("missing table");
				Object.assign(table, data);
				return table;
			},
			delete: async ({ where }: { where: { id: string } }) => {
				const index = tables.findIndex(
					(candidate) => candidate.id === where.id,
				);
				const [removed] = tables.splice(index, 1);
				if (!removed) throw new Error("missing table");
				return removed;
			},
			count: async () => tables.length,
			aggregate: async () => ({ _max: { sortOrder: null } }),
		},
		seatingAssignment: {
			findMany: async () => rows,
			create: async ({
				data,
			}: {
				data: Omit<SeatingAssignment, "id" | "createdAt">;
			}) => {
				// The database's two partial unique indexes, modelled.
				const clash = rows.some(
					(row) =>
						row.inviteId === data.inviteId &&
						row.extraGuestId === data.extraGuestId,
				);
				if (clash) {
					throw Object.assign(new Error("Unique constraint failed"), {
						code: "P2002",
					});
				}
				const row = makeAssignment(data);
				rows.push(row);
				return row;
			},
			update: async () => {
				throw new Error("not used");
			},
			deleteMany: async ({
				where,
			}: {
				where: {
					wishlistId?: string;
					inviteId?: string;
					extraGuestId?: string | null;
					tableId?: string;
				};
			}) => {
				let count = 0;
				for (let index = rows.length - 1; index >= 0; index -= 1) {
					const row = rows[index];
					if (!row) continue;
					const matches =
						(where.wishlistId === undefined ||
							row.wishlistId === where.wishlistId) &&
						(where.inviteId === undefined || row.inviteId === where.inviteId) &&
						(where.extraGuestId === undefined ||
							row.extraGuestId === where.extraGuestId) &&
						(where.tableId === undefined || row.tableId === where.tableId);
					if (matches) {
						rows.splice(index, 1);
						count += 1;
					}
				}
				return { count };
			},
		},
	};

	const db = {
		...client,
		$transaction: async <T>(
			callback: (tx: typeof client & { $queryRaw: unknown }) => Promise<T>,
		): Promise<T> => {
			let held: string | null = null;
			let release: (() => void) | undefined;

			const tx = {
				...client,
				$queryRaw: async (
					strings: TemplateStringsArray,
					...values: unknown[]
				) => {
					const sql = strings.join("?");
					queryLog.push(sql.includes("FOR UPDATE") ? "lock" : "raw");
					const tableId = String(values[0]);
					held = tableId;
					// Serialise on the table row, the way FOR UPDATE does.
					while (locks.has(tableId)) {
						await locks.get(tableId);
					}
					locks.set(
						tableId,
						new Promise<void>((resolve) => {
							release = resolve;
						}),
					);
					return [];
				},
			};

			try {
				return await callback(tx as never);
			} finally {
				if (held !== null) {
					locks.delete(held);
					release?.();
				}
			}
		},
	};

	return { db: db as unknown as SeatingMutationDatabase, rows, queryLog };
}

describe("assignPerson", () => {
	it("rejects seating into a full table", async () => {
		const invites = [
			makeInvite({ extraGuests: [makeExtra({ id: "extra_a" })] }),
			makeInvite({
				id: "invite_2",
				primaryName: "Julio Rojas",
				slug: "julio-rojas",
			}),
		];
		const table = makeTable({
			capacity: 2,
			assignments: [
				makeAssignment({ inviteId: "invite_1", extraGuestId: null }),
				makeAssignment({ inviteId: "invite_1", extraGuestId: "extra_a" }),
			],
		});
		const { db } = makeSeatingDb({ invites, tables: [table] });

		await expect(
			assignPerson(db, {
				wishlistId: "wishlist_1",
				tableId: "table_1",
				personId: "invite:invite_2",
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("leaves exactly one assignment row when a seated person moves", async () => {
		const tables = [
			makeTable({
				id: "table_1",
				assignments: [makeAssignment({ tableId: "table_1" })],
			}),
			makeTable({ id: "table_2", sortOrder: 1, assignments: [] }),
		];
		const { db, rows } = makeSeatingDb({ tables });

		await assignPerson(db, {
			wishlistId: "wishlist_1",
			tableId: "table_2",
			personId: "invite:invite_1",
		});

		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({ tableId: "table_2", inviteId: "invite_1" });
	});

	it("rejects a table and a person from different wishlists", async () => {
		const { db } = makeSeatingDb({
			tables: [makeTable({ wishlistId: "wishlist_other" })],
		});

		await expect(
			assignPerson(db, {
				wishlistId: "wishlist_1",
				tableId: "table_1",
				personId: "invite:invite_1",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("takes the row lock before reading occupancy", async () => {
		const { db, queryLog } = makeSeatingDb();

		await assignPerson(db, {
			wishlistId: "wishlist_1",
			tableId: "table_1",
			personId: "invite:invite_1",
		});

		expect(queryLog).toEqual(["lock", "findFirst:table_1"]);
	});

	it("maps a unique-constraint violation to a conflict", async () => {
		// The same person already seated elsewhere — the state the partial unique
		// indexes reject when two different tables are locked concurrently.
		const tables = [
			makeTable({
				id: "table_1",
				assignments: [makeAssignment({ tableId: "table_other" })],
			}),
		];
		const { db } = makeSeatingDb({ tables });
		// Hide the existing row from the scoped delete so the insert races it.
		const seatingDb = db as unknown as {
			seatingAssignment: { deleteMany: () => Promise<{ count: number }> };
		};
		seatingDb.seatingAssignment.deleteMany = async () => ({ count: 0 });

		await expect(
			assignPerson(db, {
				wishlistId: "wishlist_1",
				tableId: "table_1",
				personId: "invite:invite_1",
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("lets exactly one of two racing drops take the last seat", async () => {
		const invites = [
			makeInvite(),
			makeInvite({
				id: "invite_2",
				primaryName: "Julio Rojas",
				slug: "julio-rojas",
			}),
		];
		const table = makeTable({ capacity: 1, assignments: [] });
		const { db, rows } = makeSeatingDb({ invites, tables: [table] });

		const results = await Promise.allSettled([
			assignPerson(db, {
				wishlistId: "wishlist_1",
				tableId: "table_1",
				personId: "invite:invite_1",
			}),
			assignPerson(db, {
				wishlistId: "wishlist_1",
				tableId: "table_1",
				personId: "invite:invite_2",
			}),
		]);

		const fulfilled = results.filter(
			(result) => result.status === "fulfilled",
		).length;
		const rejected = results.filter(
			(result): result is PromiseRejectedResult => result.status === "rejected",
		);

		expect(fulfilled).toBe(1);
		expect(rejected).toHaveLength(1);
		expect(rejected[0]?.reason).toBeInstanceOf(TRPCError);
		expect(rejected[0]?.reason.code).toBe("CONFLICT");
		expect(rows).toHaveLength(1);
		expect(rows.length).toBeLessThanOrEqual(table.capacity);
	});
});

describe("unassignPerson", () => {
	it("is idempotent", async () => {
		const { db, rows } = makeSeatingDb({
			tables: [makeTable({ assignments: [makeAssignment()] })],
		});

		await unassignPerson(db, {
			wishlistId: "wishlist_1",
			personId: "invite:invite_1",
		});
		await unassignPerson(db, {
			wishlistId: "wishlist_1",
			personId: "invite:invite_1",
		});

		expect(rows).toHaveLength(0);
	});
});

describe("updateTable", () => {
	it("refuses a capacity below the seated count and names the most recently seated", async () => {
		const invites = [
			makeInvite({
				extraGuests: [
					makeExtra({ id: "extra_a", name: "Lucía Torres" }),
					makeExtra({ id: "extra_b", name: "Ana Torres", sortOrder: 1 }),
				],
			}),
		];
		const table = makeTable({
			capacity: 3,
			assignments: [
				makeAssignment({ extraGuestId: null }),
				makeAssignment({ extraGuestId: "extra_a" }),
				makeAssignment({ extraGuestId: "extra_b" }),
			],
		});
		const { db } = makeSeatingDb({ invites, tables: [table] });

		await expect(
			updateTable(db, {
				wishlistId: "wishlist_1",
				tableId: "table_1",
				capacity: 1,
			}),
		).rejects.toMatchObject({
			code: "CONFLICT",
			// Newest-first: Ana was seated last, Lucía before her, María first.
			message: expect.stringContaining("Ana Torres, Lucía Torres"),
		});
	});

	it("accepts a capacity equal to the seated count", async () => {
		const table = makeTable({
			capacity: 4,
			assignments: [makeAssignment()],
		});
		const { db } = makeSeatingDb({ tables: [table] });

		const updated = await updateTable(db, {
			wishlistId: "wishlist_1",
			tableId: "table_1",
			capacity: 1,
		});

		expect(updated.capacity).toBe(1);
	});

	it("rejects a capacity outside 1–20", async () => {
		const { db } = makeSeatingDb();

		await expect(
			updateTable(db, {
				wishlistId: "wishlist_1",
				tableId: "table_1",
				capacity: 21,
			}),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});
});

describe("countSeated", () => {
	it("ignores rows for people who are no longer eligible", () => {
		const invites = [makeInvite({ status: "declined" })];
		const table = makeTable({ assignments: [makeAssignment()] });

		expect(countSeated(table, toEligiblePeople(invites))).toBe(0);
	});

	it("addresses a primary guest and an extra guest apart", () => {
		expect(personIdFor("invite_1", null)).toBe("invite:invite_1");
		expect(personIdFor("invite_1", "extra_1")).toBe("extra_1");
	});
});
