import { TRPCError } from "@trpc/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	PUBLIC_WISHLIST_AUDIT_GUEST_SLUG,
	PUBLIC_WISHLIST_AUDIT_MODE_ENV,
	PUBLIC_WISHLIST_AUDIT_SLUGS,
} from "@/server/fixtures/public-wishlist-audit";
import {
	type PublicInviteDatabase,
	resolvePersonalizedInvite,
	respondToInvite,
} from "@/server/services/public-invite.service";

const now = new Date("2026-06-28T10:00:00.000Z");

function makeInvite(overrides: Record<string, unknown> = {}) {
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

function makeDb(overrides: Partial<PublicInviteDatabase["invite"]> = {}) {
	const invite = {
		findFirst: vi.fn(),
		update: vi.fn(),
		...overrides,
	};
	return { invite } as unknown as PublicInviteDatabase;
}

const seatRow = (
	inviteId: string,
	primaryName: string,
	extraGuestId: string | null = null,
) => ({
	inviteId,
	extraGuestId,
	invite: { status: "confirmed", primaryName },
	extraGuest: null,
});

function makeSeatingDb(
	inviteOverrides: Record<string, unknown> = {},
	tables: unknown[] = [
		{
			id: "t4",
			name: null,
			sortOrder: 3,
			capacity: 8,
			assignments: [
				seatRow("invite_1", "Pedro Castillo"),
				seatRow("other", "Ana Ríos"),
			],
		},
	],
) {
	const findMany = vi.fn().mockResolvedValue(tables);
	const db = {
		invite: {
			findFirst: vi
				.fn()
				.mockResolvedValue(
					makeInvite({ status: "confirmed", ...inviteOverrides }),
				),
		},
		seatingTable: { findMany },
	} as unknown as PublicInviteDatabase;
	return { db, findMany };
}

// 2026-06-28 is `now`; window opens 5 days out.
const inWindow = { eventDate: "2026-07-01T00:00:00.000Z", now };
const outOfWindow = { eventDate: "2026-07-04T00:00:00.000Z", now };

function makeWishlistRow(overrides: Record<string, unknown> = {}) {
	return {
		id: "wishlist_1",
		eventDate: null,
		rsvpDeadline: null,
		...overrides,
	};
}

function makeRespondDb({
	wishlist = makeWishlistRow(),
	invite = makeInvite(),
	inviteUpdate = vi.fn().mockImplementation(({ data }) => ({
		...invite,
		...data,
	})),
	extraGuestUpdate = vi.fn().mockResolvedValue({}),
}: {
	wishlist?: ReturnType<typeof makeWishlistRow> | null;
	invite?: ReturnType<typeof makeInvite>;
	inviteUpdate?: ReturnType<typeof vi.fn>;
	extraGuestUpdate?: ReturnType<typeof vi.fn>;
} = {}) {
	const tx = {
		invite: { update: inviteUpdate },
		inviteExtraGuest: { update: extraGuestUpdate },
	};
	const db = {
		wishlist: { findFirst: vi.fn().mockResolvedValue(wishlist) },
		invite: { findFirst: vi.fn().mockResolvedValue(invite) },
		inviteExtraGuest: { update: extraGuestUpdate },
		$transaction: vi.fn().mockImplementation((cb) => cb(tx)),
	};
	return {
		db: db as unknown as PublicInviteDatabase,
		tx,
		inviteUpdate,
		extraGuestUpdate,
	};
}

describe("resolvePersonalizedInvite", () => {
	afterEach(() => {
		delete process.env[PUBLIC_WISHLIST_AUDIT_MODE_ENV];
	});

	it("resolves the audit invite without touching the database", async () => {
		process.env[PUBLIC_WISHLIST_AUDIT_MODE_ENV] = "1";
		const findFirst = vi.fn(() => {
			throw new Error("audit invite must not query the database");
		});
		const db = makeDb({ findFirst });

		const result = await resolvePersonalizedInvite(db, {
			wishlistId: `audit-${PUBLIC_WISHLIST_AUDIT_SLUGS.light}`,
			guestSlug: PUBLIC_WISHLIST_AUDIT_GUEST_SLUG,
		});

		expect(result).toMatchObject({
			kind: "found",
			guest: { primaryName: "Invitada de auditoría" },
		});
		expect(findFirst).not.toHaveBeenCalled();
	});

	it("returns notFound when no invite matches the guest slug", async () => {
		const db = makeDb({ findFirst: vi.fn().mockResolvedValue(null) });

		const result = await resolvePersonalizedInvite(db, {
			wishlistId: "wishlist_1",
			guestSlug: "unknown",
		});

		expect(result).toEqual({ kind: "notFound" });
	});

	it("does not record a view while resolving a server-rendered page", async () => {
		const update = vi.fn().mockResolvedValue({});
		const db = makeDb({
			findFirst: vi.fn().mockResolvedValue(makeInvite({ openedAt: null })),
			update,
		});

		await resolvePersonalizedInvite(db, {
			wishlistId: "wishlist_1",
			guestSlug: "pedro-castillo",
		});

		expect(update).not.toHaveBeenCalled();
	});

	it("does not write existing invite metrics during route resolution", async () => {
		const update = vi.fn();
		const db = makeDb({
			findFirst: vi
				.fn()
				.mockResolvedValue(makeInvite({ openedAt: new Date("2026-06-01") })),
			update,
		});

		await resolvePersonalizedInvite(db, {
			wishlistId: "wishlist_1",
			guestSlug: "pedro-castillo",
		});

		expect(update).not.toHaveBeenCalled();
	});

	it("still returns the guest even when the openedAt write fails", async () => {
		const db = makeDb({
			findFirst: vi.fn().mockResolvedValue(makeInvite({ openedAt: null })),
			update: vi.fn().mockRejectedValue(new Error("db unavailable")),
		});

		const result = await resolvePersonalizedInvite(db, {
			wishlistId: "wishlist_1",
			guestSlug: "pedro-castillo",
		});

		expect(result.kind).toBe("found");
	});

	it("maps named and unnamed extra guests and the RSVP status", async () => {
		const db = makeDb({
			findFirst: vi.fn().mockResolvedValue(
				makeInvite({
					openedAt: new Date("2026-06-01"),
					status: "confirmed",
					extraGuests: [
						{ id: "g1", name: "Ana", status: "confirmed" },
						{ id: "g2", name: null, status: "pending" },
					],
				}),
			),
		});

		const result = await resolvePersonalizedInvite(db, {
			wishlistId: "wishlist_1",
			guestSlug: "pedro-castillo",
		});

		expect(result).toEqual({
			kind: "found",
			inviteId: "invite_1",
			guest: {
				slug: "pedro-castillo",
				primaryName: "Pedro Castillo",
				extraGuests: [
					{ id: "g1", name: "Ana", status: "confirmed" },
					{ id: "g2", name: null, status: "pending" },
				],
				status: "confirmed",
				responseSource: null,
				responseLockedAt: null,
			},
		});
	});
});

describe("respondToInvite", () => {
	it("confirms the whole party", async () => {
		const invite = makeInvite({
			extraGuests: [
				{ id: "g1", name: "Ana" },
				{ id: "g2", name: "Luis" },
			],
		});
		const { db, inviteUpdate, extraGuestUpdate } = makeRespondDb({ invite });

		const result = await respondToInvite(db, {
			wishlistSlug: "boda-lu",
			guestSlug: "pedro-castillo",
			status: "confirmed",
			extraGuests: [
				{ id: "g1", status: "confirmed" },
				{ id: "g2", status: "confirmed" },
			],
		});

		expect(result).toEqual({ status: "confirmed" });
		expect(inviteUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: "invite_1" },
				data: expect.objectContaining({
					status: "confirmed",
					respondedAt: expect.any(Date),
					responseSource: "guest",
				}),
			}),
		);
		expect(extraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g1" },
			data: { status: "confirmed" },
		});
		expect(extraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g2" },
			data: { status: "confirmed" },
		});
	});

	it("confirms the primary but declines one companion", async () => {
		const invite = makeInvite({
			extraGuests: [
				{ id: "g1", name: "Ana" },
				{ id: "g2", name: "Luis" },
			],
		});
		const { db, extraGuestUpdate } = makeRespondDb({ invite });

		const result = await respondToInvite(db, {
			wishlistSlug: "boda-lu",
			guestSlug: "pedro-castillo",
			status: "confirmed",
			extraGuests: [
				{ id: "g1", status: "confirmed" },
				{ id: "g2", status: "declined" },
			],
		});

		expect(result).toEqual({ status: "confirmed" });
		expect(extraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g1" },
			data: { status: "confirmed" },
		});
		expect(extraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g2" },
			data: { status: "declined" },
		});
	});

	it("forces every extra guest to declined when the primary declines", async () => {
		const invite = makeInvite({
			extraGuests: [
				{ id: "g1", name: "Ana" },
				{ id: "g2", name: "Luis" },
			],
		});
		const { db, extraGuestUpdate } = makeRespondDb({ invite });

		const result = await respondToInvite(db, {
			wishlistSlug: "boda-lu",
			guestSlug: "pedro-castillo",
			status: "declined",
			extraGuests: [
				{ id: "g1", status: "confirmed" },
				{ id: "g2", status: "confirmed" },
			],
		});

		expect(result).toEqual({ status: "declined" });
		expect(extraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g1" },
			data: { status: "declined" },
		});
		expect(extraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g2" },
			data: { status: "declined" },
		});
	});

	it("rejects a mismatched extra-guest id set", async () => {
		const invite = makeInvite({
			extraGuests: [
				{ id: "g1", name: "Ana" },
				{ id: "g2", name: "Luis" },
			],
		});
		const { db, inviteUpdate } = makeRespondDb({ invite });

		await expect(
			respondToInvite(db, {
				wishlistSlug: "boda-lu",
				guestSlug: "pedro-castillo",
				status: "confirmed",
				extraGuests: [{ id: "g1", status: "confirmed" }],
			}),
		).rejects.toThrow(TRPCError);
		expect(inviteUpdate).not.toHaveBeenCalled();
	});

	it("rejects once the wishlist's event date has passed", async () => {
		const { db, inviteUpdate } = makeRespondDb({
			wishlist: makeWishlistRow({ eventDate: new Date("2020-01-01") }),
		});

		await expect(
			respondToInvite(db, {
				wishlistSlug: "boda-lu",
				guestSlug: "pedro-castillo",
				status: "confirmed",
				extraGuests: [],
			}),
		).rejects.toThrow(TRPCError);
		expect(inviteUpdate).not.toHaveBeenCalled();
	});

	it("rejects once the RSVP deadline has passed when there is no event date", async () => {
		const { db, inviteUpdate } = makeRespondDb({
			wishlist: makeWishlistRow({ rsvpDeadline: new Date("2020-01-01") }),
		});

		await expect(
			respondToInvite(db, {
				wishlistSlug: "boda-lu",
				guestSlug: "pedro-castillo",
				status: "confirmed",
				extraGuests: [],
			}),
		).rejects.toThrow(TRPCError);
		expect(inviteUpdate).not.toHaveBeenCalled();
	});

	it("allows a later response to overwrite an earlier one", async () => {
		const invite = makeInvite({
			status: "confirmed",
			respondedAt: new Date("2026-06-01"),
			extraGuests: [{ id: "g1", name: "Ana" }],
		});
		const { db, inviteUpdate } = makeRespondDb({ invite });

		const result = await respondToInvite(db, {
			wishlistSlug: "boda-lu",
			guestSlug: "pedro-castillo",
			status: "declined",
			extraGuests: [{ id: "g1", status: "confirmed" }],
		});

		expect(result).toEqual({ status: "declined" });
		expect(inviteUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					status: "declined",
					respondedAt: expect.any(Date),
					responseSource: "guest",
				}),
			}),
		);
	});

	it("throws NOT_FOUND when the wishlist slug does not match", async () => {
		const { db } = makeRespondDb({ wishlist: null });

		await expect(
			respondToInvite(db, {
				wishlistSlug: "unknown",
				guestSlug: "pedro-castillo",
				status: "confirmed",
				extraGuests: [],
			}),
		).rejects.toThrow(TRPCError);
	});

	it("rejects an owner-locked response before any writes", async () => {
		const { db, inviteUpdate } = makeRespondDb({
			invite: makeInvite({ responseLockedAt: new Date("2026-06-01") }),
		});

		await expect(
			respondToInvite(db, {
				wishlistSlug: "boda-lu",
				guestSlug: "pedro-castillo",
				status: "confirmed",
				extraGuests: [],
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
		expect(inviteUpdate).not.toHaveBeenCalled();
	});
});

describe("resolvePersonalizedInvite seating pass", () => {
	it("loads the party's tables and returns a pass inside the window", async () => {
		const { db, findMany } = makeSeatingDb();
		const result = await resolvePersonalizedInvite(db, {
			wishlistId: "wishlist_1",
			guestSlug: "pedro-castillo",
			...inWindow,
		});
		expect(findMany).toHaveBeenCalledTimes(1);
		expect(result.kind === "found" && result.seatingPass?.headline.label).toBe(
			"Mesa 4",
		);
		expect(
			result.kind === "found" && result.seatingPass?.tables[0]?.mates,
		).toEqual(["Ana R."]);
	});

	it("does not query seating outside the window", async () => {
		const { db, findMany } = makeSeatingDb();
		const result = await resolvePersonalizedInvite(db, {
			wishlistId: "wishlist_1",
			guestSlug: "pedro-castillo",
			...outOfWindow,
		});
		expect(findMany).not.toHaveBeenCalled();
		expect(result.kind === "found" && result.seatingPass).toBeFalsy();
	});

	it("does not query seating for non-confirmed invites or without an event date", async () => {
		const pending = makeSeatingDb({ status: "pending" });
		await resolvePersonalizedInvite(pending.db, {
			wishlistId: "wishlist_1",
			guestSlug: "pedro-castillo",
			...inWindow,
		});
		expect(pending.findMany).not.toHaveBeenCalled();

		const undated = makeSeatingDb();
		await resolvePersonalizedInvite(undated.db, {
			wishlistId: "wishlist_1",
			guestSlug: "pedro-castillo",
			eventDate: null,
			now,
		});
		expect(undated.findMany).not.toHaveBeenCalled();
	});

	it("carries no other-invite names when showMates is false", async () => {
		const { db } = makeSeatingDb();
		const result = await resolvePersonalizedInvite(db, {
			wishlistId: "wishlist_1",
			guestSlug: "pedro-castillo",
			showMates: false,
			...inWindow,
		});
		expect(JSON.stringify(result)).not.toContain("Ana");
		expect(result.kind === "found" && result.seatingPass).toBeTruthy();
	});
});
