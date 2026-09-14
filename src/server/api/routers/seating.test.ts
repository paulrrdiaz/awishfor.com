import { beforeEach, describe, expect, it, vi } from "vitest";
import { seatingRouter } from "@/server/api/routers/seating";
import { createCallerFactory } from "@/server/api/trpc";

const authMock = vi.hoisted(() => vi.fn());
const currentUserMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
	currentUser: currentUserMock,
}));

const createCaller = createCallerFactory(seatingRouter);

const OWNER_ID = 42;
const COLLABORATOR_ID = 43;
const STRANGER_ID = 44;

/**
 * Mirrors `assertWishlistAccess`: the owner matches on `ownerId`, a
 * collaborator on `members.some.userId`, and anybody else gets `null` — which
 * the service turns into NOT_FOUND rather than FORBIDDEN.
 */
const wishlistFindFirst = (localUserId: number) =>
	vi
		.fn()
		.mockImplementation(({ where }: { where: Record<string, unknown> }) => {
			const or = where.OR as
				| [{ ownerId: number }, { members: { some: { userId: number } } }]
				| undefined;
			if (!or) return Promise.resolve(null);
			const [byOwner, byMember] = or;
			const allowed =
				(localUserId === OWNER_ID && byOwner.ownerId === localUserId) ||
				(localUserId === COLLABORATOR_ID &&
					byMember.members.some.userId === localUserId);
			return Promise.resolve(
				allowed ? { id: "wishlist_1", ownerId: OWNER_ID } : null,
			);
		});

function makeDb(localUserId: number) {
	const seatingTableCreateMany = vi.fn().mockResolvedValue({ count: 1 });
	return {
		db: {
			user: { findUnique: vi.fn().mockResolvedValue({ id: localUserId }) },
			wishlist: { findFirst: wishlistFindFirst(localUserId) },
			invite: { findMany: vi.fn().mockResolvedValue([]) },
			seatingTable: {
				findMany: vi.fn().mockResolvedValue([]),
				findFirst: vi.fn().mockResolvedValue(null),
				createMany: seatingTableCreateMany,
				update: vi.fn(),
				delete: vi.fn(),
				count: vi.fn().mockResolvedValue(0),
				aggregate: vi.fn().mockResolvedValue({ _max: { sortOrder: null } }),
			},
			seatingAssignment: {
				findMany: vi.fn().mockResolvedValue([]),
				create: vi.fn(),
				update: vi.fn(),
				deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
			},
			$transaction: vi.fn(),
		},
		seatingTableCreateMany,
	};
}

const makeCaller = (db: Record<string, unknown>) =>
	createCaller({ db, headers: new Headers() } as never);

const createTablesInput = {
	wishlistId: "wishlist_1",
	shape: "round" as const,
	capacity: 10,
	count: 1,
};

beforeEach(() => {
	vi.clearAllMocks();
	authMock.mockResolvedValue({ userId: "clerk_123" });
});

describe("seatingRouter access", () => {
	it("lets the owner read the board", async () => {
		const { db } = makeDb(OWNER_ID);
		const board = await makeCaller(db).board({ wishlistId: "wishlist_1" });

		expect(board.tables).toEqual([]);
		expect(board.totals.eligiblePeople).toBe(0);
	});

	it("lets the owner write", async () => {
		const { db, seatingTableCreateMany } = makeDb(OWNER_ID);
		await makeCaller(db).createTables(createTablesInput);

		expect(seatingTableCreateMany).toHaveBeenCalledOnce();
	});

	it("lets a collaborator read the board", async () => {
		const { db } = makeDb(COLLABORATOR_ID);
		await expect(
			makeCaller(db).board({ wishlistId: "wishlist_1" }),
		).resolves.toMatchObject({ wishlistId: "wishlist_1" });
	});

	it("lets a collaborator write — seating is not owner-only", async () => {
		const { db, seatingTableCreateMany } = makeDb(COLLABORATOR_ID);
		await makeCaller(db).createTables(createTablesInput);

		expect(seatingTableCreateMany).toHaveBeenCalledOnce();
	});

	it("hides the board from an unrelated user", async () => {
		const { db } = makeDb(STRANGER_ID);
		await expect(
			makeCaller(db).board({ wishlistId: "wishlist_1" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("hides writes from an unrelated user", async () => {
		const { db, seatingTableCreateMany } = makeDb(STRANGER_ID);
		await expect(
			makeCaller(db).createTables(createTablesInput),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		expect(seatingTableCreateMany).not.toHaveBeenCalled();
	});

	it("rejects a capacity outside 1–20 before touching the database", async () => {
		const { db, seatingTableCreateMany } = makeDb(OWNER_ID);
		await expect(
			makeCaller(db).createTables({ ...createTablesInput, capacity: 21 }),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
		expect(seatingTableCreateMany).not.toHaveBeenCalled();
	});
});
