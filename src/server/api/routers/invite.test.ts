import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { inviteRouter } from "@/server/api/routers/invite";
import { createCallerFactory } from "@/server/api/trpc";

const authMock = vi.hoisted(() => vi.fn());
const currentUserMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
	currentUser: currentUserMock,
}));

const createCaller = createCallerFactory(inviteRouter);

const now = new Date("2026-06-28T10:00:00.000Z");

function makeInviteRow(overrides: Record<string, unknown> = {}) {
	return {
		id: "invite_1",
		wishlistId: "wishlist_1",
		primaryName: "Pedro Castillo",
		primaryEmail: null,
		primaryPhone: null,
		slug: "pedro-castillo",
		status: "pending",
		openedAt: null,
		respondedAt: null,
		createdAt: now,
		updatedAt: now,
		extraGuests: [],
		...overrides,
	};
}

function makeDb({
	userFindUnique = vi.fn().mockResolvedValue({ id: 42 }),
	wishlistFindFirst = vi.fn().mockResolvedValue({ id: "wishlist_1" }),
	inviteFindFirst = vi.fn().mockResolvedValue(null),
	inviteFindMany = vi.fn().mockResolvedValue([]),
	inviteCreate = vi.fn(),
	inviteUpdate = vi.fn(),
	inviteDelete = vi.fn(),
}: {
	userFindUnique?: ReturnType<typeof vi.fn>;
	wishlistFindFirst?: ReturnType<typeof vi.fn>;
	inviteFindFirst?: ReturnType<typeof vi.fn>;
	inviteFindMany?: ReturnType<typeof vi.fn>;
	inviteCreate?: ReturnType<typeof vi.fn>;
	inviteUpdate?: ReturnType<typeof vi.fn>;
	inviteDelete?: ReturnType<typeof vi.fn>;
} = {}) {
	return {
		user: { findUnique: userFindUnique },
		wishlist: { findFirst: wishlistFindFirst },
		invite: {
			findFirst: inviteFindFirst,
			findMany: inviteFindMany,
			create: inviteCreate,
			update: inviteUpdate,
			delete: inviteDelete,
		},
	};
}

function makeCaller(db: Record<string, unknown>) {
	return createCaller({ db, headers: new Headers() } as never);
}

beforeEach(() => {
	vi.clearAllMocks();
	authMock.mockResolvedValue({ userId: "clerk_123" });
});

describe("inviteRouter ownership", () => {
	it("rejects create when the caller does not own the wishlist", async () => {
		const db = makeDb({ wishlistFindFirst: vi.fn().mockResolvedValue(null) });
		const caller = makeCaller(db);

		await expect(
			caller.create({
				wishlistId: "wishlist_1",
				primaryName: "Pedro Castillo",
				extraGuests: [],
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		expect(db.invite.create).not.toHaveBeenCalled();
	});

	it("rejects list when the caller does not own the wishlist", async () => {
		const db = makeDb({ wishlistFindFirst: vi.fn().mockResolvedValue(null) });
		const caller = makeCaller(db);

		await expect(
			caller.list({ wishlistId: "wishlist_1" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("rejects update/delete when the invite does not belong to the caller", async () => {
		const db = makeDb({ inviteFindFirst: vi.fn().mockResolvedValue(null) });
		const caller = makeCaller(db);

		await expect(
			caller.update({ inviteId: "invite_1", primaryName: "Otro" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		await expect(caller.delete({ inviteId: "invite_1" })).rejects.toMatchObject(
			{
				code: "NOT_FOUND",
			},
		);
	});
});

describe("inviteRouter.create", () => {
	it("rejects more than 4 extra guests", async () => {
		const db = makeDb();
		const caller = makeCaller(db);

		await expect(
			caller.create({
				wishlistId: "wishlist_1",
				primaryName: "Pedro Castillo",
				extraGuests: [{}, {}, {}, {}, {}],
			}),
		).rejects.toThrow();
		expect(db.invite.create).not.toHaveBeenCalled();
	});

	it("derives a slug from the primary name when none is given", async () => {
		const db = makeDb({
			inviteCreate: vi.fn().mockResolvedValue(makeInviteRow()),
		});
		const caller = makeCaller(db);

		await caller.create({
			wishlistId: "wishlist_1",
			primaryName: "Pedro Castillo",
			extraGuests: [],
		});

		expect(db.invite.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ slug: "pedro-castillo" }),
			}),
		);
	});

	it("rejects a slug already used by a sibling invite in the same wishlist", async () => {
		const db = makeDb({
			inviteFindMany: vi.fn().mockResolvedValue([{ slug: "pedro-castillo" }]),
		});
		const caller = makeCaller(db);

		await expect(
			caller.create({
				wishlistId: "wishlist_1",
				primaryName: "Otra Persona",
				slug: "pedro-castillo",
				extraGuests: [],
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
		expect(db.invite.create).not.toHaveBeenCalled();
	});

	it("rejects a slug that collides with a reserved route segment", async () => {
		const db = makeDb();
		const caller = makeCaller(db);

		await expect(
			caller.create({
				wishlistId: "wishlist_1",
				primaryName: "Pedro Castillo",
				slug: "edit",
				extraGuests: [],
			}),
		).rejects.toThrow(TRPCError);
		expect(db.invite.create).not.toHaveBeenCalled();
	});
});

describe("inviteRouter.respond", () => {
	it("confirms attendance and sets respondedAt", async () => {
		const inviteUpdate = vi
			.fn()
			.mockResolvedValue(makeInviteRow({ status: "confirmed" }));
		const db = makeDb({
			inviteFindFirst: vi.fn().mockResolvedValue({ id: "invite_1" }),
			inviteUpdate,
		});
		const caller = makeCaller(db);

		const result = await caller.respond({
			wishlistSlug: "lista-de-boda",
			guestSlug: "pedro-castillo",
			status: "confirmed",
		});

		expect(result.status).toBe("confirmed");
		expect(inviteUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ status: "confirmed" }),
			}),
		);
	});

	it("declines attendance and sets respondedAt", async () => {
		const inviteUpdate = vi
			.fn()
			.mockResolvedValue(makeInviteRow({ status: "declined" }));
		const db = makeDb({
			inviteFindFirst: vi.fn().mockResolvedValue({ id: "invite_1" }),
			inviteUpdate,
		});
		const caller = makeCaller(db);

		const result = await caller.respond({
			wishlistSlug: "lista-de-boda",
			guestSlug: "pedro-castillo",
			status: "declined",
		});

		expect(result.status).toBe("declined");
	});

	it("rejects a status other than confirmed or declined", async () => {
		const db = makeDb();
		const caller = makeCaller(db);

		await expect(
			caller.respond({
				wishlistSlug: "lista-de-boda",
				guestSlug: "pedro-castillo",
				status: "pending" as never,
			}),
		).rejects.toThrow();
		expect(db.invite.update).not.toHaveBeenCalled();
	});

	it("rejects when no invite matches the guest slug", async () => {
		const db = makeDb({ inviteFindFirst: vi.fn().mockResolvedValue(null) });
		const caller = makeCaller(db);

		await expect(
			caller.respond({
				wishlistSlug: "lista-de-boda",
				guestSlug: "unknown",
				status: "confirmed",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
