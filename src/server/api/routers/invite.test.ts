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
		responseSource: null,
		responseLockedAt: null,
		createdAt: now,
		updatedAt: now,
		extraGuests: [],
		...overrides,
	};
}

function makeDb({
	userFindUnique = vi.fn().mockResolvedValue({ id: 42 }),
	wishlistFindFirst = vi.fn().mockResolvedValue({
		id: "wishlist_1",
		eventDate: null,
		rsvpDeadline: null,
	}),
	inviteFindFirst = vi.fn().mockResolvedValue(null),
	inviteFindMany = vi.fn().mockResolvedValue([]),
	inviteCreate = vi.fn(),
	inviteUpdate = vi.fn(),
	inviteDelete = vi.fn(),
	inviteExtraGuestUpdate = vi.fn().mockResolvedValue({}),
}: {
	userFindUnique?: ReturnType<typeof vi.fn>;
	wishlistFindFirst?: ReturnType<typeof vi.fn>;
	inviteFindFirst?: ReturnType<typeof vi.fn>;
	inviteFindMany?: ReturnType<typeof vi.fn>;
	inviteCreate?: ReturnType<typeof vi.fn>;
	inviteUpdate?: ReturnType<typeof vi.fn>;
	inviteDelete?: ReturnType<typeof vi.fn>;
	inviteExtraGuestUpdate?: ReturnType<typeof vi.fn>;
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
		inviteExtraGuest: { update: inviteExtraGuestUpdate },
		$transaction: vi.fn().mockImplementation((cb) =>
			cb({
				invite: { update: inviteUpdate },
				inviteExtraGuest: { update: inviteExtraGuestUpdate },
			}),
		),
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
			inviteFindFirst: vi
				.fn()
				.mockResolvedValue(makeInviteRow({ extraGuests: [] })),
			inviteUpdate,
		});
		const caller = makeCaller(db);

		const result = await caller.respond({
			wishlistSlug: "lista-de-boda",
			guestSlug: "pedro-castillo",
			status: "confirmed",
			extraGuests: [],
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
			inviteFindFirst: vi
				.fn()
				.mockResolvedValue(makeInviteRow({ extraGuests: [] })),
			inviteUpdate,
		});
		const caller = makeCaller(db);

		const result = await caller.respond({
			wishlistSlug: "lista-de-boda",
			guestSlug: "pedro-castillo",
			status: "declined",
			extraGuests: [],
		});

		expect(result.status).toBe("declined");
	});

	it("confirms the primary and every extra guest in one submit", async () => {
		const inviteUpdate = vi
			.fn()
			.mockResolvedValue(makeInviteRow({ status: "confirmed" }));
		const inviteExtraGuestUpdate = vi.fn().mockResolvedValue({});
		const db = makeDb({
			inviteFindFirst: vi.fn().mockResolvedValue(
				makeInviteRow({
					extraGuests: [
						{ id: "g1", name: "Ana" },
						{ id: "g2", name: "Luis" },
					],
				}),
			),
			inviteUpdate,
			inviteExtraGuestUpdate,
		});
		const caller = makeCaller(db);

		await caller.respond({
			wishlistSlug: "lista-de-boda",
			guestSlug: "pedro-castillo",
			status: "confirmed",
			extraGuests: [
				{ id: "g1", status: "confirmed" },
				{ id: "g2", status: "declined" },
			],
		});

		expect(inviteExtraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g1" },
			data: { status: "confirmed" },
		});
		expect(inviteExtraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g2" },
			data: { status: "declined" },
		});
	});

	it("rejects a status other than confirmed or declined", async () => {
		const db = makeDb();
		const caller = makeCaller(db);

		await expect(
			caller.respond({
				wishlistSlug: "lista-de-boda",
				guestSlug: "pedro-castillo",
				status: "pending" as never,
				extraGuests: [],
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
				extraGuests: [],
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("rejects a mismatched extra-guest id set", async () => {
		const db = makeDb({
			inviteFindFirst: vi
				.fn()
				.mockResolvedValue(
					makeInviteRow({ extraGuests: [{ id: "g1", name: "Ana" }] }),
				),
		});
		const caller = makeCaller(db);

		await expect(
			caller.respond({
				wishlistSlug: "lista-de-boda",
				guestSlug: "pedro-castillo",
				status: "confirmed",
				extraGuests: [{ id: "unknown-id", status: "confirmed" }],
			}),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
		expect(db.invite.update).not.toHaveBeenCalled();
	});
});

describe("inviteRouter owner RSVP", () => {
	it("records a whole-party owner response and locks the invite", async () => {
		const inviteUpdate = vi.fn().mockResolvedValue(makeInviteRow());
		const db = makeDb({
			inviteFindFirst: vi
				.fn()
				.mockResolvedValue(
					makeInviteRow({ extraGuests: [{ id: "g1", status: "pending" }] }),
				),
			inviteUpdate,
		});

		await makeCaller(db).recordOwnerRsvp({
			inviteId: "invite_1",
			status: "confirmed",
			extraGuests: [{ id: "g1", status: "declined" }],
		});

		expect(inviteUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					responseSource: "owner",
					responseLockedAt: expect.any(Date),
				}),
			}),
		);
	});

	it("rejects collaborator attempts to manage RSVP locks", async () => {
		const db = makeDb({
			inviteFindFirst: vi.fn().mockResolvedValue(makeInviteRow()),
			wishlistFindFirst: vi.fn().mockResolvedValue(null),
		});

		await expect(
			makeCaller(db).reopenOwnerRsvp({ inviteId: "invite_1" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		expect(db.invite.update).not.toHaveBeenCalled();
	});

	it("corrects a locked response, forces declined companions, and bypasses guest deadlines", async () => {
		const inviteUpdate = vi.fn().mockResolvedValue(makeInviteRow());
		const inviteExtraGuestUpdate = vi.fn().mockResolvedValue({});
		const db = makeDb({
			inviteFindFirst: vi.fn().mockResolvedValue(
				makeInviteRow({
					responseLockedAt: new Date("2026-06-01"),
					extraGuests: [{ id: "g1", status: "confirmed" }],
				}),
			),
			inviteUpdate,
			inviteExtraGuestUpdate,
			wishlistFindFirst: vi.fn().mockResolvedValue({ id: "wishlist_1" }),
		});

		await makeCaller(db).recordOwnerRsvp({
			inviteId: "invite_1",
			status: "declined",
			extraGuests: [{ id: "g1", status: "confirmed" }],
		});

		expect(inviteExtraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g1" },
			data: { status: "declined" },
		});
		expect(inviteUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ status: "declined" }),
			}),
		);
	});

	it("rejects owner responses with an incomplete companion set", async () => {
		const inviteUpdate = vi.fn();
		const db = makeDb({
			inviteFindFirst: vi
				.fn()
				.mockResolvedValue(
					makeInviteRow({ extraGuests: [{ id: "g1", status: "pending" }] }),
				),
			inviteUpdate,
		});

		await expect(
			makeCaller(db).recordOwnerRsvp({
				inviteId: "invite_1",
				status: "confirmed",
				extraGuests: [],
			}),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
		expect(inviteUpdate).not.toHaveBeenCalled();
	});

	it("reopens a locked response without changing attendance statuses", async () => {
		const inviteUpdate = vi.fn().mockResolvedValue(makeInviteRow());
		const db = makeDb({
			inviteFindFirst: vi
				.fn()
				.mockResolvedValue(
					makeInviteRow({ status: "confirmed", responseLockedAt: new Date() }),
				),
			inviteUpdate,
		});

		await makeCaller(db).reopenOwnerRsvp({ inviteId: "invite_1" });

		expect(inviteUpdate).toHaveBeenCalledWith({
			where: { id: "invite_1" },
			data: { responseSource: null, responseLockedAt: null },
		});
	});
});

describe("inviteRouter.recordFollowUpCopy", () => {
	it("records a copied follow-up for the wishlist owner", async () => {
		const inviteUpdate = vi.fn().mockResolvedValue(makeInviteRow());
		const db = makeDb({
			inviteFindFirst: vi.fn().mockResolvedValue(makeInviteRow()),
			inviteUpdate,
		});

		await makeCaller(db).recordFollowUpCopy({
			wishlistId: "wishlist_1",
			inviteId: "invite_1",
			kind: "rsvp_reminder",
		});

		expect(inviteUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					lastFollowUpKind: "rsvp_reminder",
					lastFollowUpCopiedAt: expect.any(Date),
				}),
			}),
		);
	});

	it("rejects collaborator and cross-wishlist copy attempts", async () => {
		const collaboratorDb = makeDb({
			inviteFindFirst: vi.fn().mockResolvedValue(makeInviteRow()),
			wishlistFindFirst: vi.fn().mockResolvedValue(null),
		});
		await expect(
			makeCaller(collaboratorDb).recordFollowUpCopy({
				wishlistId: "wishlist_1",
				inviteId: "invite_1",
				kind: "invitation",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		expect(collaboratorDb.invite.update).not.toHaveBeenCalled();

		const crossWishlistDb = makeDb({
			inviteFindFirst: vi.fn().mockResolvedValue(makeInviteRow()),
		});
		await expect(
			makeCaller(crossWishlistDb).recordFollowUpCopy({
				wishlistId: "another_wishlist",
				inviteId: "invite_1",
				kind: "invitation",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		expect(crossWishlistDb.invite.update).not.toHaveBeenCalled();
	});

	it("rejects an invalid follow-up kind before updating", async () => {
		const db = makeDb();
		await expect(
			makeCaller(db).recordFollowUpCopy({
				wishlistId: "wishlist_1",
				inviteId: "invite_1",
				kind: "sent" as never,
			}),
		).rejects.toThrow();
		expect(db.invite.update).not.toHaveBeenCalled();
	});
});
